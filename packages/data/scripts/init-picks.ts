import {
  getEntryPicks,
  getFPLData,
} from "@open-fpl/data/features/RemoteData/fpl";
import fs from "fs-extra";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const {
  SUPABASE_SECRET_KEY: supabaseSecretKey,
  SUPABASE_URL: supabaseUrl,
  SUPABASE_STORAGE_NAME: _supabaseStorageName,
  ENTRIES_LIMIT: _entriesLimit,
  SAVE_FEQUENCY: _saveFrequency,
} = process.env;

const entriesLimit = _entriesLimit ? +_entriesLimit : null;
const saveFrequency = _saveFrequency ? +_saveFrequency : 1000;
const supabaseStorageName = _supabaseStorageName ?? "open-fpl";

type StorageStrategies = {
  [key: string]: {
    client?: any;
    init?: () => Promise<any> | void;
    save: (event: number, data: any) => void;
  };
};

const strategies: StorageStrategies = {
  disk: {
    init: function () {
      return fs.promises.mkdir(`./public/app-data/picks`, { recursive: true });
    },
    save: function (event, data) {
      return fs.promises.writeFile(
        `./public/app-data/picks/${event}.json`,
        JSON.stringify(data)
      );
    },
  },
  supabase: {
    init: function () {
      this.client = createClient(supabaseUrl!, supabaseSecretKey!, {
        headers: {},
      });
    },
    save: async function (event, data) {
      const supabase = this.client as SupabaseClient;
      const [{ error: dbError }, { error: storageError }] = await Promise.all([
        supabase.from("picks").insert([{ id: event, data }], { upsert: true }),
        supabase.storage
          .from(supabaseStorageName)
          .upload(`app-data/picks/${event}.json`, JSON.stringify(data), {
            contentType: "application/json",
            upsert: true,
          }),
      ]);

      if (dbError)
        throw new Error(`Error saving to Supabase DB: ${dbError.message}`);

      if (storageError)
        throw new Error(
          `Error saving to Supabase storage: ${storageError.message}`
        );
    },
  },
};

// TODO: use pRetry on pull entry retry and save picks retry, and use async-pool to manage concurrency

(async function () {
  const { total_players, events } = await getFPLData();
  const currentEvent = events.find((e) => e.is_current);
  if (total_players && currentEvent) {
    const start = new Date();
    console.log(`Total players: ${total_players.toLocaleString()}`);
    console.log(`Started: ${start}`);
    console.log(`Event: ${currentEvent.id}`);

    const isSupabaseMode = supabaseSecretKey !== undefined;
    const strategy =
      isSupabaseMode && supabaseUrl ? strategies.supabase : strategies.disk;

    if (isSupabaseMode)
      console.log("Found Supabase key and url, using Supabase data storage");

    const limit = entriesLimit
      ? Math.min(entriesLimit, total_players)
      : total_players;

    if (entriesLimit)
      console.log(
        `Found entries limit settings, will pull only until ${limit.toLocaleString()}th entry`
      );

    await strategy.init?.();

    let retry = 0;
    let id = 1;
    const allPicks: number[][] = [];
    while (id <= limit) {
      if (id % saveFrequency === 0) {
        console.log(`Time elapsed: ${new Date().getTime() - start.getTime()}`);
        console.log(`${id} done...`);
        await strategy.save(currentEvent.id, allPicks);
      }

      const response = await getEntryPicks(id, currentEvent.id);
      if (typeof response === "string") {
        console.log(`Fail to get entry ${id}`);
        if (retry < 5) {
          retry++;
          console.log(`Retrying (${retry}) for ${id}`);
        } else {
          console.log(`Max retries reached, skipping ${id}`);
          allPicks[id] = [];
          id++;
        }
      } else {
        const { picks } = response;
        const picksArray = picks.map((p) => p.element);
        const captain = picks.find((p) => p.is_captain)!.element;
        const viceCaptain = picks.find((p) => p.is_vice_captain)!.element;
        allPicks.push([...picksArray, captain, viceCaptain]);
        id++;
      }
    }

    await strategy.save(currentEvent.id, allPicks);
    console.log("All done");
  } else {
    console.log("Unable to get total_players or current event");
  }
})();

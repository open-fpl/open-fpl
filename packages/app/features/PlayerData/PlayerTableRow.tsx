import {
  Box,
  Checkbox,
  Flex,
  Grid,
  Icon,
  IconButton,
  Link as A,
  TableRowProps,
  Td,
  Text,
  Tr,
} from "@chakra-ui/react";
import CenterFlex from "@open-fpl/app/features/PlayerData/CenterFlex";
import FixturesSection from "@open-fpl/app/features/PlayerData/FixturesSection";
import PastMatchesStats from "@open-fpl/app/features/PlayerData/PastMatchesStats";
import { assumedMax } from "@open-fpl/app/features/PlayerData/playerData";
import { ClientPlayer } from "@open-fpl/app/features/PlayerData/playerDataTypes";
import {
  rowHeight,
  rowWidth,
} from "@open-fpl/app/features/PlayerData/PlayerTable";
import playerTableConfigs from "@open-fpl/app/features/PlayerData/playerTableConfigs";
import PointsSection from "@open-fpl/app/features/PlayerData/PointsSection";
import { getPaddedPastMatches } from "@open-fpl/app/features/PlayerData/PreviousStatsSection";
import { teamColorCodes } from "@open-fpl/app/features/TeamData/teamData";
import {
  positionColorCodes,
  statusColorCodes,
} from "@open-fpl/data/features/RemoteData/fplColors";
import dynamic from "next/dynamic";
import { ChangeEvent, MouseEventHandler } from "react";
import {
  IoOpenOutline,
  IoStar,
  IoStarOutline,
  IoWarningOutline,
} from "react-icons/io5";

const Tooltip = dynamic(() => import("@open-fpl/app/features/Common/Tooltip"));

export const PlayerTableRow = ({
  player,
  isSelected,
  onSelectChange,
  isStarred,
  onStarClick,
  ...props
}: TableRowProps & {
  player: ClientPlayer;
  isSelected: boolean;
  onSelectChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isStarred: boolean;
  onStarClick: MouseEventHandler<HTMLButtonElement>;
}) => {
  const pastMatches = getPaddedPastMatches(player);
  return (
    <Tr height={`${rowHeight}px`} width={`${rowWidth}px`} {...props}>
      <Td
        p={0}
        bg="white"
        fontWeight="bold"
        position={
          playerTableConfigs.Tool.sticky !== undefined ? "sticky" : "static"
        }
        left={playerTableConfigs.Tool.sticky}
      >
        <Flex
          height={`${rowHeight}px`}
          width={`${playerTableConfigs.Tool.columnWidth}px`}
          alignItems="center"
          px={2}
        >
          <Checkbox
            mr={1}
            size="lg"
            aria-label="select player"
            borderWidth={0}
            isChecked={isSelected}
            onChange={onSelectChange}
            borderRadius="none"
          />
          <IconButton
            mr={1}
            size="xs"
            aria-label="star player"
            icon={<Icon as={isStarred ? IoStar : IoStarOutline} />}
            variant={isStarred ? "solid" : "ghost"}
            onClick={onStarClick}
          />
          <A
            isExternal
            href={
              player.linked_data?.understat_id
                ? `https://understat.com/player/${player.linked_data.understat_id}`
                : `https://understat.com/league/EPL`
            }
          >
            <IconButton
              as="span"
              size="xs"
              variant="ghost"
              aria-label="open in Understat"
              icon={<Icon as={IoOpenOutline} />}
            />
          </A>
        </Flex>
      </Td>
      <Td
        p={0}
        bg="white"
        fontWeight="bold"
        position={
          playerTableConfigs.Name.sticky !== undefined ? "sticky" : "static"
        }
        left={playerTableConfigs.Name.sticky}
      >
        <Flex
          height={`${rowHeight}px`}
          width={`${playerTableConfigs.Name.columnWidth}px`}
          alignItems="center"
        >
          {player.status !== "a" && (
            <Tooltip hasArrow label={player.news}>
              <CenterFlex
                variant="mini"
                bg={statusColorCodes[player.status]}
                height="100%"
              >
                <IoWarningOutline />
              </CenterFlex>
            </Tooltip>
          )}
          <Text px={2} textAlign="left" fontSize="sm" noOfLines={1}>
            {player.web_name}
          </Text>
        </Flex>
      </Td>
      <Td p={0}>
        <CenterFlex
          variant="mini"
          width={`${playerTableConfigs.Team.columnWidth}px`}
          height={`${rowHeight}px`}
          bg={
            teamColorCodes[player.team.short_name]
              ? teamColorCodes[player.team.short_name].bg
              : "white"
          }
          color={
            teamColorCodes[player.team.short_name]
              ? teamColorCodes[player.team.short_name].color
              : "black"
          }
        >
          {player.team.short_name}
        </CenterFlex>
      </Td>
      <Td p={0}>
        <CenterFlex
          variant="mini"
          width={`${playerTableConfigs.Position.columnWidth}px`}
          height={`${rowHeight}px`}
          bg={
            positionColorCodes[player.element_type.singular_name_short]
              .background
          }
          color={
            positionColorCodes[player.element_type.singular_name_short].text
          }
        >
          {player.element_type.singular_name_short}
        </CenterFlex>
      </Td>
      <Td p={0}>
        <Flex
          pr={4}
          justifyContent="flex-end"
          alignItems="center"
          height={`${rowHeight}px`}
          width={`${playerTableConfigs.Cost.columnWidth}px`}
          fontSize="sm"
        >
          £{(player.now_cost / 10).toFixed(1)}
        </Flex>
      </Td>
      <Td p={0}>
        <Flex
          pr={4}
          justifyContent="flex-end"
          alignItems="center"
          height={`${rowHeight}px`}
          width={`${playerTableConfigs.Ownership.columnWidth}px`}
          fontSize="sm"
        >
          {(+player.selected_by_percent).toFixed(1)}%
        </Flex>
      </Td>
      <Td p={0}>
        <Box width={`${playerTableConfigs.Fixtures.columnWidth}px`}>
          <FixturesSection variant="mini" player={player} />
        </Box>
      </Td>
      <Td p={0}>
        <Flex
          width={`${playerTableConfigs.Points.columnWidth}px`}
          height={`${rowHeight}px`}
        >
          <PointsSection variant="mini" player={player} />
        </Flex>
      </Td>
      <Td p={0}>
        <Grid
          gap={0}
          templateColumns="repeat(6, 1fr)"
          width={`${playerTableConfigs.xG.columnWidth}px`}
          height={`${rowHeight}px`}
        >
          <PastMatchesStats
            variant="mini"
            pastMatches={pastMatches}
            valueKey="match_g"
            maxValue={assumedMax.g}
            sumValue={player.linked_data.season_g}
            decimal={0}
          />
        </Grid>
      </Td>
      <Td p={0}>
        <Grid
          gap={0}
          templateColumns="repeat(6, 1fr)"
          width={`${playerTableConfigs.xGA.columnWidth}px`}
          height={`${rowHeight}px`}
        >
          <PastMatchesStats
            variant="mini"
            pastMatches={pastMatches}
            valueKey="match_a"
            maxValue={assumedMax.a}
            sumValue={player.linked_data.season_a}
            decimal={0}
          />
        </Grid>
      </Td>
      <Td p={0}>
        <Grid
          gap={0}
          templateColumns="repeat(6, 1fr)"
          width={`${playerTableConfigs.xGA.columnWidth}px`}
          height={`${rowHeight}px`}
        >
          <PastMatchesStats
            variant="mini"
            pastMatches={pastMatches}
            valueKey="match_shots"
            maxValue={assumedMax.shots}
            sumValue={player.linked_data.season_shots}
            decimal={0}
          />
        </Grid>
      </Td>
      <Td p={0}>
        <Grid
          gap={0}
          templateColumns="repeat(6, 1fr)"
          width={`${playerTableConfigs.xGA.columnWidth}px`}
          height={`${rowHeight}px`}
        >
          <PastMatchesStats
            variant="mini"
            pastMatches={pastMatches}
            valueKey="match_key_passes"
            maxValue={assumedMax.keyPasses}
            sumValue={player.linked_data.season_key_passes}
            decimal={0}
          />
        </Grid>
      </Td>
      <Td p={0}>
        <Grid
          gap={0}
          templateColumns="repeat(6, 1fr)"
          width={`${playerTableConfigs.xGA.columnWidth}px`}
          height={`${rowHeight}px`}
        >
          <PastMatchesStats
            variant="mini"
            pastMatches={pastMatches}
            valueKey="match_xg"
            maxValue={assumedMax.xg}
            sumValue={player.linked_data.season_xg}
            decimal={1}
          />
        </Grid>
      </Td>
      <Td p={0}>
        <Grid
          gap={0}
          templateColumns="repeat(6, 1fr)"
          width={`${playerTableConfigs.xGA.columnWidth}px`}
          height={`${rowHeight}px`}
        >
          <PastMatchesStats
            variant="mini"
            pastMatches={pastMatches}
            valueKey="match_xa"
            maxValue={assumedMax.xa}
            sumValue={player.linked_data.season_xa}
            decimal={1}
          />
        </Grid>
      </Td>
      <Td p={0}>
        <Grid
          gap={0}
          templateColumns="repeat(6, 1fr)"
          width={`${playerTableConfigs.xGA.columnWidth}px`}
          height={`${rowHeight}px`}
        >
          <PastMatchesStats
            variant="mini"
            pastMatches={pastMatches}
            valueKey="match_xga"
            maxValue={assumedMax.xga}
            sumValue={player.linked_data.season_xga}
            decimal={1}
            isReversedScale
          />
        </Grid>
      </Td>
    </Tr>
  );
};

export default PlayerTableRow;

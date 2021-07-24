import {
  Box,
  BoxProps,
  Button,
  Divider,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from "@chakra-ui/react";
import { AnalyticsPlayerStatisticsExplorer } from "@open-fpl/app/features/Analytics/analyticsTypes";
import { ClientPlayer } from "@open-fpl/app/features/PlayerData/playerDataTypes";
import {
  DisplayOptions,
  SortOptions,
} from "@open-fpl/app/features/PlayersExplorer/playersExplorerTypes";
import {
  displayOptions,
  sortOptions,
} from "@open-fpl/app/features/PlayersExplorer/playersToolbarOptions";
import usePlayersFilterAndSort from "@open-fpl/app/features/PlayersExplorer/usePlayersFilterAndSort";
import { usePlausible } from "next-plausible";
import dynamic from "next/dynamic";
import { ChangeEvent, MouseEventHandler, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";

const Tooltip = dynamic(() => import("@open-fpl/app/features/Common/Tooltip"));

const PlayersExplorerToolbar = ({
  initialSeachQuery = "",
  players = [],
  onResults = () => {},
  display = displayOptions[0].value,
  onDisplayChange,
  disabledSorting = false,
  sortingTooltipLabel,
  showCompareButton = false,
  onCompareClick,
  onResetClick,
  ...props
}: BoxProps & {
  initialSeachQuery?: string;
  players?: ClientPlayer[];
  onResults?: (players: ClientPlayer[]) => void;
  display?: string;
  onDisplayChange?: (value: DisplayOptions) => void;
  disabledSorting?: boolean;
  sortingTooltipLabel?: string;
  showCompareButton?: boolean;
  onCompareClick?: MouseEventHandler<HTMLButtonElement>;
  onResetClick?: MouseEventHandler<HTMLButtonElement>;
}) => {
  const plausible = usePlausible<AnalyticsPlayerStatisticsExplorer>();
  const { filterQuery, setFilterQuery, sort, setSort, fiterThenSortFn } =
    usePlayersFilterAndSort({
      initialSeachQuery,
      players,
    });

  const handleDisplayChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onDisplayChange?.(e.target.value as DisplayOptions);
    plausible("players-display", { props: { display: e.target.value } });
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSort(value as SortOptions);
    plausible("players-sort", { props: { sort: e.target.value } });
  };

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterQuery(e.target.value);
    plausible("players-query", { props: { query: e.target.value } });
  };

  useEffect(() => {
    onResults(fiterThenSortFn(players));
  }, [fiterThenSortFn]);

  const sortSelectComponent = (
    <Box flexShrink={0}>
      <Select
        disabled={disabledSorting}
        borderWidth={0}
        borderRadius="none"
        value={sort}
        onChange={handleSortChange}
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </Box>
  );

  return (
    <>
      <HStack
        alignItems="center"
        height="50px"
        width="100%"
        px={1}
        spacing={1}
        {...props}
      >
        {showCompareButton && (
          <>
            <HStack flexShrink={0}>
              <Button borderRadius="none" onClick={onCompareClick}>
                Compare
              </Button>
              <Button
                variant="outline"
                borderRadius="none"
                onClick={onResetClick}
              >
                Reset
              </Button>
            </HStack>
            <Divider orientation="vertical" />
          </>
        )}
        <Box flexGrow={1}>
          <InputGroup mr={1}>
            <InputLeftElement
              pointerEvents="none"
              children={<IoSearchOutline />}
            />
            <Input
              borderWidth={0}
              borderRadius="none"
              placeholder="Search for player..."
              value={filterQuery}
              onChange={handleQueryChange}
            />
          </InputGroup>
        </Box>
        <Divider orientation="vertical" />
        {sortingTooltipLabel ? (
          <Tooltip label={sortingTooltipLabel} hasArrow>
            {sortSelectComponent}
          </Tooltip>
        ) : (
          sortSelectComponent
        )}
        <Divider orientation="vertical" />
        <Box flexShrink={0}>
          <Select
            borderWidth={0}
            borderRadius="none"
            value={display}
            onChange={handleDisplayChange}
          >
            {displayOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Box>
      </HStack>
    </>
  );
};

export default PlayersExplorerToolbar;

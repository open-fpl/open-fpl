import { Box, Flex } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import NextNprogress from "nextjs-progressbar";
import { ReactNode } from "react";
import SideBar from "@open-fpl/app/features/Navigation/SideBar";
import theme from "@open-fpl/app/theme";

const NotSupportSmallScreen = dynamic(
  () => import("@open-fpl/app/features/Error/NotSupportSmallScreen")
);

const AppLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <>
      <NextNprogress color={theme.colors.brand[500]} />
      <Flex h="100%" w="100%" display={["none", "flex"]}>
        <Box flexBasis="200px" flexShrink={0}>
          <SideBar />
        </Box>
        <Box flexBasis="100%">{children}</Box>
      </Flex>
      <NotSupportSmallScreen display={["flex", "none"]} />
    </>
  );
};

export default AppLayout;

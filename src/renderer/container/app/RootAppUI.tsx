import { Box, chakra, HStack } from "@chakra-ui/react";
import React, { Fragment } from "react";
import { useAppRoute } from "../../context/route";
import { usePageTitle } from "../../hook/page-title";
import { ContextSelectMenu } from "../k8s-context/ContextSelectMenu";
import { NamespacesSelectMenu } from "../k8s-namespace/NamespacesSelectMenu";
import { Sticky, stickToTopAndScrollDown } from "react-unstuck";
import { OverviewStyleSelectMenu } from "../overview-style/OverviewStyleSelectMenu";

const ChakraSticky = chakra(Sticky);

export const RootAppUI: React.FunctionComponent = () => {
    const { context } = useAppRoute();

    usePageTitle(context);

    return (
        <Fragment>
            <ChakraSticky
                behavior={stickToTopAndScrollDown}
                bg="rgba(255, 255, 255, 0.8)"
                backdropFilter="blur(4px)"
            >
                <HStack spacing={2} padding={2}>
                    <ContextSelectMenu />
                    <NamespacesSelectMenu />
                    <OverviewStyleSelectMenu />
                </HStack>
            </ChakraSticky>
            <Box>
                {Array(50)
                    .fill(0)
                    .map((_, i) => (
                        <p key={i}>test {i}</p>
                    ))}
            </Box>
        </Fragment>
    );
};

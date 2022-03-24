import {
    Box,
    HStack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    useColorModeValue,
    useToken,
} from "@chakra-ui/react";
import React, { ReactNode, useCallback, useMemo, useRef } from "react";
import { ParamNamespace } from "../../context/param";
import { useModifierKeyRef } from "../../hook/keyboard";
import { useWindowFocusValue } from "../../hook/window-focus";

export type ContentTab = {
    id: string;
    title: string;
    content: ReactNode;
};

export type ContentTabsProps = {
    tabs: ContentTab[];
    selected?: string;
    onChangeSelection?: (selection: string, requestNewWindow?: boolean) => void;
    isLazy?: boolean;
};

export const ContentTabs: React.FC<ContentTabsProps> = (props) => {
    const { isLazy = false, onChangeSelection, selected, tabs } = props;

    const primaryColorIsGray =
        useToken("colors", "primary.500") === useToken("colors", "gray.500");
    const tabsBackgroundColor = useColorModeValue(
        "primary.100",
        primaryColorIsGray ? "primary.700" : "primary.900"
    );
    const focusBoxShadow = useToken("shadows", "outline");

    const tabTextColor = useColorModeValue("primary.900", "white");
    const selectedTabTextColor = "white";
    const selectedTabBackgroundColor = "primary.500";

    const opacity = useWindowFocusValue(1.0, 0.5);

    let tabIndex = tabs.findIndex((tab) => selected && tab.id === selected);
    if (tabIndex === -1) {
        tabIndex = 0;
    }
    const tabIndexRef = useRef(tabIndex);
    const metaKeyRef = useModifierKeyRef("Meta");
    const onChangeTabIndex = useCallback(
        (index: number) => {
            if (index >= 0 && tabs.length > index) {
                onChangeSelection?.(tabs[index].id, metaKeyRef.current);
            }
        },
        [metaKeyRef, onChangeSelection, tabIndexRef]
    );

    // We set onClick on Tab instead of onChange on Tabs because Tabs calls
    // onChange multiple times in sequence, causing trouble when we request
    // a new window.
    const onChangeTabIndexes = useMemo(
        () =>
            tabs.map((_, index) => () => {
                onChangeTabIndex(index);
            }),
        [onChangeTabIndex]
    );

    return (
        <Tabs
            display="flex"
            w="100%"
            h="100%"
            flexDirection="column"
            variant="soft-rounded"
            colorScheme="primary"
            index={tabIndex}
            isLazy={isLazy}
        >
            <TabList flex="0 0 0" opacity={opacity} m={2}>
                <HStack
                    flex="0 0 0"
                    bg={tabsBackgroundColor}
                    borderRadius={6}
                    spacing={1}
                >
                    {tabs.map((tab, index) => (
                        <Tab
                            key={tab.id}
                            borderRadius={6}
                            _focus={{}}
                            fontWeight="normal"
                            textColor={tabTextColor}
                            _focusVisible={{
                                boxShadow: focusBoxShadow,
                            }}
                            _selected={{
                                bg: selectedTabBackgroundColor,
                                textColor: selectedTabTextColor,
                            }}
                            onClick={onChangeTabIndexes[index]}
                        >
                            {tab.title}
                        </Tab>
                    ))}
                </HStack>
                <Box flex="1 0 0"></Box>
            </TabList>
            <TabPanels
                flex="1 0 0"
                display="flex"
                overflow="hidden"
                flexDirection="column"
            >
                {tabs.map((tab) => (
                    <TabPanel
                        key={tab.id}
                        display="flex"
                        flexDirection="column"
                        flex="1 0 0"
                        overflow="hidden"
                        p={0}
                    >
                        <ParamNamespace name={tab.id}>
                            {tab.content}
                        </ParamNamespace>
                    </TabPanel>
                ))}
            </TabPanels>
        </Tabs>
    );
};

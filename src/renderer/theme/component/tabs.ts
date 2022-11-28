import { mode } from "@chakra-ui/theme-tools";

const content = (props) => {
    const bgGradient = mode(
        "linear(to-t, gray.200 0%, gray.100 4px, gray.100 70%, gray.200 180%)",
        "linear(to-t, gray.700 -20%, gray.800 4px, gray.800 70%, gray.900 180%)"
    )(props);

    const borderColor = mode("gray.200", "gray.700")(props);

    const selectedBg = mode("white", "gray.900")(props);
    const selectedColor = mode("black", "white")(props);

    return {
        tablist: {
            bgGradient,
        },
        tab: {
            whiteSpace: "nowrap",
            marginLeft: "-1px",
            color: mode("gray.600", "gray.200")(props),
            borderLeft: "1px solid",
            borderRight: "1px solid",
            borderColor,
            borderTopColor: "transparent",
            fontWeight: "semibold",
            fontSize: props.size,
            textTransform: "uppercase",
            px: 5,
            py: 2,
            bgGradient,
            _selected: {
                color: selectedColor,
                bg: selectedBg,
                _hover: {
                    bg: selectedBg,
                },
            },
            _hover: {
                bg: "blackAlpha.200",
            },
            _active: {},
            _disabled: {},
            _focus: {
                boxShadow: "none",
            },
            _focusVisible: {
                boxShadow: "outline",
            },
        },
    };
};

export const Tabs = {
    baseStyle: () => {},
    defaultProps: {
        colorScheme: "primary",
        size: "sm",
    },
    variants: {
        content,
    },
};

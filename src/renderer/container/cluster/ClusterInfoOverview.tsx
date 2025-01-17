import React, { useMemo } from "react";

import { ScrollBox } from "../../component/main/ScrollBox";

import { useK8sListWatch } from "../../k8s/list-watch";
import { useK8sContextsInfo } from "../../hook/k8s-contexts-info";
import { useK8sContext } from "../../context/k8s-context";
import {
    Heading,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Tr,
    VStack,
} from "@chakra-ui/react";
import { Selectable } from "../../component/main/Selectable";
import { K8sObject } from "../../../common/k8s/client";
import { parseCpu, parseMemory } from "../../../common/k8s/util";
import { useK8sVersion } from "../../k8s/version";

const cloudProviderNames: Record<string, string> = {
    aws: "AWS",
    azure: "Azure",
    gcp: "Google Cloud Platform",
    local: "Local development",
};
const cloudServiceNames: Record<string, string> = {
    colima: "colima",
    eks: "EKS",
};

export const ClusterInfoOverview: React.FC = () => {
    const [, nodes] = useK8sListWatch(
        {
            apiVersion: "v1",
            kind: "Node",
        },
        {},
        []
    );

    const context = useK8sContext();

    const [, contextsInfo] = useK8sContextsInfo();
    const contextInfo = contextsInfo.find((info) => info.name === context);

    const [versionIsLoading, version] = useK8sVersion({
        pollInterval: 30000,
    });

    const title = contextInfo?.cluster ?? context;

    const cloudProviderTitle = contextInfo?.cloudInfo?.cloudProvider
        ? cloudProviderNames[contextInfo.cloudInfo.cloudProvider] ??
          contextInfo.cloudInfo.cloudProvider
        : "Cloud";

    return (
        <ScrollBox>
            <VStack alignItems="stretch" spacing={6}>
                <VStack alignItems="stretch" spacing={1}>
                    <Heading isTruncated>Cluster</Heading>
                    <Table size="sm" sx={{ tableLayout: "fixed" }}>
                        <Tbody>
                            <Tr>
                                <StatTh>Name</StatTh>
                                <StatTd>
                                    <Selectable>{title}</Selectable>
                                </StatTd>
                            </Tr>
                            <Tr>
                                <StatTh>Version</StatTh>
                                <StatTd>
                                    {!versionIsLoading && version && (
                                        <Selectable>
                                            {version.major}.{version.minor} (
                                            {version.platform})
                                        </Selectable>
                                    )}
                                </StatTd>
                            </Tr>
                            {contextInfo &&
                                contextInfo?.cluster !== contextInfo?.name && (
                                    <Tr>
                                        <StatTh>Cluster</StatTh>
                                        <StatTd>
                                            <Selectable>
                                                {contextInfo.cluster}
                                            </Selectable>
                                        </StatTd>
                                    </Tr>
                                )}
                            {contextInfo &&
                                contextInfo?.user !== contextInfo?.name && (
                                    <Tr>
                                        <StatTh>User</StatTh>
                                        <StatTd>
                                            <Selectable>
                                                {contextInfo.user}
                                            </Selectable>
                                        </StatTd>
                                    </Tr>
                                )}
                            <Tr>
                                <StatTh>Nodes</StatTh>
                                <StatTd>
                                    <Selectable>
                                        {nodes?.items.length ?? ""}
                                    </Selectable>
                                </StatTd>
                            </Tr>
                        </Tbody>
                    </Table>
                </VStack>

                <VStack alignItems="stretch" spacing={1}>
                    <Heading isTruncated>Capacity</Heading>
                    {nodes && <CapacityTable nodes={nodes?.items} />}
                </VStack>

                <VStack alignItems="stretch" spacing={1}>
                    <Heading isTruncated>{cloudProviderTitle}</Heading>

                    <Table size="sm" sx={{ tableLayout: "fixed" }}>
                        <Tbody>
                            {contextInfo?.cloudInfo?.cloudService && (
                                <Tr>
                                    <StatTh>Service</StatTh>
                                    <StatTd>
                                        <Selectable>
                                            {cloudServiceNames[
                                                contextInfo.cloudInfo
                                                    .cloudService
                                            ] ??
                                                contextInfo.cloudInfo
                                                    .cloudService}
                                        </Selectable>
                                    </StatTd>
                                </Tr>
                            )}
                            {contextInfo?.cloudInfo?.region && (
                                <Tr>
                                    <StatTh>Region</StatTh>
                                    <StatTd>
                                        <Selectable>
                                            {contextInfo.cloudInfo?.region}
                                        </Selectable>
                                    </StatTd>
                                </Tr>
                            )}

                            {contextInfo?.cloudInfo?.accounts?.map(
                                (account, index) => (
                                    <Tr
                                        key={
                                            account.accountId +
                                            ":" +
                                            account.accountName
                                        }
                                    >
                                        <StatTh>
                                            {index === 0 ? "Account" : ""}
                                        </StatTh>
                                        <StatTd>
                                            <Selectable>
                                                {[
                                                    account.accountId,
                                                    account.accountName,
                                                ]
                                                    .filter((t) => t)
                                                    .join(" / ")}
                                            </Selectable>
                                        </StatTd>
                                    </Tr>
                                )
                            )}
                        </Tbody>
                    </Table>
                </VStack>
            </VStack>
        </ScrollBox>
    );
};

function sum(numbers: number[]): number {
    return numbers.reduce((x, y) => x + y, 0);
}

const CapacityTable: React.FC<{ nodes: K8sObject[] }> = (props) => {
    const { nodes } = props;

    const cpu = useMemo(
        () =>
            sum(
                nodes.map(
                    (node) =>
                        parseCpu((node as any)?.status?.capacity?.cpu ?? "0") ??
                        0
                )
            ),
        [nodes]
    );

    const memory = useMemo(
        () =>
            sum(
                nodes.map(
                    (node) =>
                        parseMemory(
                            (node as any)?.status?.capacity?.memory ?? "0",
                            "Gi"
                        ) ?? 0
                )
            ),
        [nodes]
    );

    if (!nodes) {
        return null;
    }

    return (
        <Table size="sm" sx={{ tableLayout: "fixed" }}>
            <Tbody>
                <Tr>
                    <StatTh>CPU</StatTh>
                    <StatTd>
                        <Selectable>{cpu === 0 ? "" : cpu}</Selectable>
                    </StatTd>
                </Tr>
                <Tr>
                    <StatTh>Memory</StatTh>
                    <StatTd>
                        <Selectable>
                            {memory === 0
                                ? ""
                                : `${memory.toLocaleString(undefined, {
                                      maximumFractionDigits: 2,
                                      minimumFractionDigits: 1,
                                  })} Gi`}
                        </Selectable>
                    </StatTd>
                </Tr>
            </Tbody>
        </Table>
    );
};

const StatTh: React.FC<{}> = ({ children, ...props }) => {
    return (
        <Th
            width="150px"
            whiteSpace="nowrap"
            textAlign="left"
            verticalAlign="baseline"
            ps={0}
            py={2}
            minWidth="150px"
            {...props}
        >
            <Text isTruncated>{children}</Text>
        </Th>
    );
};
const StatTd: React.FC<{}> = ({ children, ...props }) => {
    return (
        <Td verticalAlign="baseline" py={2} {...props}>
            <Text isTruncated>{children}&nbsp;</Text>
        </Td>
    );
};

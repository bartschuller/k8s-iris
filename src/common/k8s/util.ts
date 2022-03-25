import { K8sObject, K8sObjectList } from "./client";

function objSameRef(
    obj1: K8sObject,
    obj2: K8sObject,
    checkKind = true
): boolean {
    if (!obj1) {
        return !obj2;
    }
    if (checkKind) {
        if (obj1.apiVersion !== obj2.apiVersion || obj1.kind !== obj2.kind) {
            return false;
        }
    }
    return (
        obj1.metadata.name === obj2.metadata.name &&
        obj1.metadata.namespace === obj2.metadata.namespace
    );
}

export function addListObject<T extends K8sObject = K8sObject>(
    list: K8sObjectList<T>,
    obj: T,
    checkKind = false
): K8sObjectList<T> {
    if (
        list.items.findIndex((item) => objSameRef(item, obj, checkKind)) !== -1
    ) {
        // The item is already in the list.
        return list;
    }
    return { ...list, items: [...list.items, obj] };
}

export function updateListObject<T extends K8sObject = K8sObject>(
    list: K8sObjectList<T>,
    obj: T,
    checkKind = false
): K8sObjectList<T> {
    return {
        ...list,
        items: list.items.map((item) =>
            objSameRef(item, obj, checkKind) ? obj : item
        ),
    };
}

export function deleteListObject<T extends K8sObject = K8sObject>(
    list: K8sObjectList<T>,
    obj: T,
    checkKind = false
): K8sObjectList<T> {
    return {
        ...list,
        items: list.items.filter((item) => !objSameRef(item, obj, checkKind)),
    };
}

export function parseCpu(cpu: string): number | null {
    const match = cpu.match(/^([0-9\.]+)([a-z]?)$/);
    if (!match) {
        return null;
    }
    const number = 1 * (match[1] as any);
    return (
        number /
        (match[2] === "n"
            ? 1000000000
            : match[2] === "u"
            ? 1000000
            : match[2] === "m"
            ? 1000
            : 1)
    );
}

export function parseMemory(
    memory: string,
    targetUnit: "Ki" | "Mi" | "Gi" | "Ti"
): number | null {
    const match = memory.match(/^([0-9\.]+)([a-zA-Z]*)$/);
    if (!match) {
        return null;
    }
    const number = 1 * (match[1] as any);
    const sourceUnit = match[2];
    const unitAdjustments: Record<typeof targetUnit, number> = {
        Ki: 1,
        Mi: 1024,
        Gi: 1024 * 1024,
        Ti: 1024 * 1024 * 1024,
    };
    return (
        (number * (unitAdjustments[sourceUnit] ?? 1)) /
        (unitAdjustments[targetUnit] ?? 1)
    );
}

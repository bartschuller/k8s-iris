import { useConst } from "@chakra-ui/react";
import React, { PropsWithChildren, useEffect } from "react";
import { create, createStore } from "../util/state";

const { useStore, useStoreValue, useStoreValueGetter } = create(false);

export const useHibernate = useStoreValue;
export const useHibernateGetter = useStoreValueGetter;

export const HibernateContainer: React.FC<
    PropsWithChildren<{
        hibernate?: boolean;
    }>
> = (props) => {
    const { hibernate = false, children } = props;

    const store = useConst(() => createStore(hibernate));
    const parentStore = useStore();
    useEffect(() => {
        store.set(hibernate || parentStore.get());
        const listener = (newParentValue: boolean) => {
            store.set(hibernate || newParentValue);
        };
        parentStore.subscribe(listener);
        return () => {
            parentStore.unsubscribe(listener);
        };
    }, [hibernate, parentStore, store]);

    return React.createElement(
        useStore.Context.Provider,
        { value: store },
        children
    );
};

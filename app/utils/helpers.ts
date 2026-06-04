import {useIntl} from "react-intl";

export function useT() {
    const intl = useIntl();

    return (key: string) =>
        intl.formatMessage({ id: key });
}
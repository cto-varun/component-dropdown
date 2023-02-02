import React from 'react';
import { Select } from 'antd';
import useDropdown from './useDropdown';
import './styles.css';

const { Option } = Select;

const LabelWrapper = ({ children, label, labelLeft }) => {
    const styles = labelLeft
        ? {
              className: 'label-wrapper--parent',
          }
        : {};
    return (
        <div {...styles}>
            {label ? <h3>{label}</h3> : null}
            {children}
        </div>
    );
};

const mapOptions = (placeholder, values) => {
    return [
        <Option key={placeholder} value={placeholder} disabled>
            {placeholder}
        </Option>,
        ...values.map(({ value, label }) => (
            <Option key={value} value={value}>
                {label.html ? (
                    <div dangerouslySetInnerHTML={{ __html: label.html }} />
                ) : (
                    label
                )}
            </Option>
        )),
    ];
};

const handleSelectionChange = (componentID, id) => (value) => {
    window[window.sessionStorage?.tabId][`${componentID}_setDDState`]({ id, value });
};

const setDefaultValue = (
    defaultValue,
    options = [],
    fromState,
    placeholder,
    onChange
) => {
    if (defaultValue !== undefined && options.length) {
        if (fromState.value === undefined) {
            onChange(defaultValue);
        }

        return {
            defaultValue,
            value:
                fromState.value !== undefined ? fromState.value : defaultValue,
        };
    }

    if (defaultValue === undefined) {
        return {
            value:
                fromState.value !== undefined ? fromState.value : placeholder,
        };
    }

    return {};
};

const Dropdown = (props) => {
    const {
        component: {
            id: componentID,
            params: {
                elements = [],
                saveState = false,
                subscribers = [],
                styles = '',
            },
        },
        children = false,
    } = props;

    const { state } = useDropdown(
        componentID,
        elements,
        saveState,
        subscribers
    );

    const childrenArray = children ? React.Children.toArray(children) : false;

    return elements.length ? (
        <div className={`${componentID} row--dropdown-info`}>
            {styles ? (
                <style dangerouslySetInnerHTML={{ __html: styles }} />
            ) : null}
            {elements.map(
                ({
                    id,
                    type,
                    childIndex = null,
                    labelTitle = '',
                    placeholder = '',
                    labelLeft = false,
                    dropdownStyle = null,
                    defaultOption = undefined,
                }) => {
                    const fromState = state[id];
                    if (type === 'display') {
                        return (
                            <LabelWrapper label={labelTitle} key={id}>
                                <p>{fromState}</p>
                            </LabelWrapper>
                        );
                    }

                    if (type === 'childComponent') {
                        if (
                            typeof childIndex === 'number' &&
                            childrenArray &&
                            childrenArray[childIndex] !== undefined
                        ) {
                            return (
                                <LabelWrapper label={labelTitle} key={id}>
                                    {React.cloneElement(
                                        childrenArray[childIndex],
                                        { parentProps: props }
                                    )}
                                </LabelWrapper>
                            );
                        }

                        return <LabelWrapper label={labelTitle} key={id} />;
                    }

                    if (type.startsWith('dropdown')) {
                        const { options = [] } = fromState;
                        const onChange = handleSelectionChange(componentID, id);
                        const setDefaults = setDefaultValue(
                            defaultOption,
                            options,
                            fromState,
                            placeholder,
                            onChange
                        );

                        return (
                            <LabelWrapper
                                key={id}
                                label={labelTitle}
                                labelLeft={labelLeft}
                            >
                                <Select
                                    dropdownStyle={dropdownStyle}
                                    placeholder={placeholder}
                                    onChange={onChange}
                                    disabled={fromState.disabled || !options}
                                    {...setDefaults}
                                >
                                    {options.length
                                        ? mapOptions(placeholder, options)
                                        : null}
                                </Select>
                            </LabelWrapper>
                        );
                    }

                    return null;
                }
            )}
        </div>
    ) : null;
};

export default Dropdown;

import { useEffect, useReducer } from 'react';

const updateState = (oldState, updateID, updateValue, updateType = 'value') => {
    const newState = {};

    Object.keys(oldState).forEach((id) => {
        const previousElement = oldState[id];

        if (id === updateID && previousElement.type === 'display') {
            newState[id] = {
                ...previousElement,
                value: updateValue,
            };
        } else if (
            previousElement.type &&
            previousElement.type.startsWith('dropdown')
        ) {
            if (previousElement.type === 'dropdown--conditional') {
                newState[id] = {
                    ...previousElement,
                    options:
                        updateID === previousElement.generatedFrom
                            ? previousElement.optionsList[updateValue]
                            : previousElement.optionsList[
                                  oldState[previousElement.generatedFrom].value
                              ],
                    value:
                        id === updateID ? updateValue : previousElement.value,
                };
            } else {
                newState[id] = {
                    ...previousElement,
                    options:
                        id === updateID && updateType === 'options'
                            ? updateValue
                            : previousElement.options,
                    value:
                        id === updateID && updateType === 'value'
                            ? updateValue
                            : previousElement.value,
                };
            }
        }
    });

    return newState;
};

const reducer = (state, action) => {
    if (action.type === 'reset') {
        return {
            ...state,
            ...defaultState(action.reset),
        };
    }

    if (action.type === 'resetValue') {
        const previousElement = state[action.id] || {};

        if (previousElement.type === 'dropdown--conditional') {
            return {
                ...state,
                [action.id]: {
                    ...previousElement,
                    options:
                        (previousElement.optionsList &&
                            previousElement.optionsList[
                                (state[previousElement.generatedFrom] &&
                                    state[previousElement.generatedFrom]
                                        .value) ||
                                    previousElement.defaultValue
                            ]) ||
                        undefined,
                    value: undefined,
                },
            };
        }

        if (previousElement.type === 'dropdown--basic') {
            return {
                ...state,
                [action.id]: {
                    ...previousElement,
                    value:
                        previousElement.defaultValue !== undefined
                            ? previousElement.defaultValue
                            : undefined,
                },
            };
        }

        return {
            ...state,
            [action.id]: {
                ...previousElement,
                value:
                    previousElement.defaultValue !== undefined
                        ? previousElement.defaultValue
                        : undefined,
            },
        };
    }

    if (action.type === 'set') {
        return {
            ...state,
            ...updateState(
                state,
                action.id,
                action.value,
                action.updateType || 'value'
            ),
        };
    }

    return state;
};

const checkDisabled = (fn, state) => {
    if (typeof fn === 'boolean') return fn;

    try {
        const fnResult = new Function('state', `return ${fn}`)(state);
        return typeof fnResult === 'boolean' ? fnResult : false;
    } catch (e) {
        return false;
    }
};

const getOptions = (el, state) => {
    if (el.type === 'dropdown--conditional') {
        const { generatedFrom } = el;
        const stateValue = state[generatedFrom].value;

        const options = el.optionsList[stateValue];

        return options && options.length
            ? options.map((opt) => ({
                  label: opt.label !== undefined ? opt.label : opt,
                  value: opt.value !== undefined ? opt.value : opt,
              }))
            : options;
    }

    return el.options.map((opt) => ({
        label: opt.label !== undefined ? opt.label : opt,
        value: opt.value !== undefined ? opt.value : opt,
    }));
};

const usableState = (state) => {
    const usable = {};
    Object.keys(state).forEach((key) => {
        const el = state[key];
        if (el.type.startsWith('dropdown')) {
            usable[key] = {
                value: el.value,
                options: getOptions(el, state),
                disabled: checkDisabled(el.disabled || '', state),
            };
        } else {
            usable[key] = el.value;
        }
    });

    return usable;
};

const defaultState = (elements) => {
    const state = {};

    elements.forEach((element) => {
        if (element.type === 'display') {
            state[element.id] = {
                type: element.type,
                element,
                defaultValue:
                    element.defaultValue !== undefined
                        ? element.defaultValue
                        : undefined,
                value:
                    element.defaultValue !== undefined
                        ? element.defaultValue
                        : undefined,
            };
        } else if (element.type.startsWith('dropdown')) {
            const base = {
                type: element.type,
                element,
                defaultValue: element.defaultValue || undefined,
                disabled: element.disabled || undefined,
            };
            if (element.type === 'dropdown--conditional') {
                const typeProperties = {
                    generatedFrom: element.generateFrom || '',
                    optionsList: element.options || {},
                };
                state[element.id] = {
                    ...base,
                    ...typeProperties,
                    options:
                        (base.optionsList &&
                            base.optionsList[
                                base.defaultValue ||
                                    (state[base.generatedFrom] &&
                                        state[base.generatedFrom].value)
                            ]) ||
                        undefined,
                    value: undefined,
                };
            } else {
                state[element.id] = {
                    ...base,
                    options: element.options || [],
                    value:
                        element.defaultValue !== undefined
                            ? element.defaultValue
                            : undefined,
                };
            }
        }
    });

    return state;
};

const set = (dispatch, state) => ({ id, value, updateType = 'value' }) => {
    if (state[id] && state[id].value !== value) {
        const { clearIDs } = state[id].element;
        if (clearIDs && Array.isArray(clearIDs)) {
            clearIDs.forEach((idToClear) => {
                dispatch({
                    type: 'resetValue',
                    id: idToClear,
                });
            });
        }
    }

    dispatch({
        type: 'set',
        id,
        value,
        updateType,
    });

    if (state[id] && state[id].element.onSelect) {
        const { onSelect } = state[id].element;
        if (value === onSelect.value || !onSelect.value) {
            try {
                new Function('value', `return ${onSelect.execute}`)(value);
            } catch (e) {}
        }
    }
};

const get = (state) => (params) => {
    const { id = '', showUsable = true } = params || {};
    if (id && id !== '') {
        return showUsable ? usableState(state)[id] : state[id];
    }
    return showUsable ? usableState(state) : state;
};

const reset = (dispatch, elements) => ({ id }) => {
    if (id) {
        dispatch({
            type: 'resetValue',
            id,
        });
        return;
    }

    dispatch({
        type: 'reset',
        reset: elements,
    });
};

const save = (state, id) => () => {
    window[window.sessionStorage?.tabId].dp.set(`${id}_saveDDState`, state);
};

const handleUse = (id, { functionName, params, process }, result) => {
    const fnName = `${id}_${functionName}DDState`;
    if (window[window.sessionStorage?.tabId][fnName]) {
        window[window.sessionStorage?.tabId][fnName]({
            ...params,
            [process]: result,
        });
    }
};

const createSubscribers = (id, subscribersArray) => {
    subscribersArray.forEach((subscriber) => {
        const name = `${id}_${subscriber.name}`;
        let fnResult;
        if (subscriber.fn) {
            let value;
            if (subscriber.getFromDP) {
                value = window[window.sessionStorage?.tabId].dp.get(subscriber.getFromDP.key);
            }

            fnResult = new Function('storage', `return ${subscriber.fn}`)(
                value
            );

            handleUse(id, subscriber.use, fnResult);
        }

        if (subscriber.caller) {
            const { caller } = subscriber;
            if (window[window.sessionStorage?.tabId][caller]) {
                window[window.sessionStorage?.tabId][name] = (...args) => {
                    const result = window[window.sessionStorage?.tabId][caller](...args);
                    handleUse(id, subscriber.use, result);
                };
            }
        }

        if (subscriber.create) {
            window[window.sessionStorage?.tabId][name] = (
                {
                    result = null,
                    command = '',
                    preprocessor = false,
                    sideEffect = false,
                },
                payload = undefined
            ) => {
                if (command === 'RESET') {
                    if (sideEffect) {
                        new Function(`return ${sideEffect}`)();
                    }
                    handleUse(id, subscriber.use, fnResult);
                    return;
                }

                if (preprocessor) {
                    const preprocessedResult = new Function(
                        'res',
                        `return ${preprocessor}`
                    )(payload !== undefined ? payload.value : result);

                    if (preprocessedResult === undefined) {
                        return;
                    }

                    handleUse(id, subscriber.use, preprocessedResult);
                    return;
                }

                if (sideEffect) {
                    new Function(`return ${sideEffect}`)();
                }

                handleUse(id, subscriber.use, result);
            };
        }
    });
};
const cleanupSubscribers = (id, subscribersArray) => {
    subscribersArray.forEach((subscriber) => {
        const name = `${id}_${subscriber.name}`;
        if (name in window) {
            delete window[window.sessionStorage?.tabId][name];
        }
    });
};

const useDropdown = (id, elements, saveState, subscribers) => {
    const [state, dispatch] = useReducer(reducer, {}, () =>
        defaultState(elements)
    );
    useEffect(() => {
        window[window.sessionStorage?.tabId][`${id}_setDDState`] = set(dispatch, state);
        window[window.sessionStorage?.tabId][`${id}_getDDState`] = get(state);
        window[window.sessionStorage?.tabId][`${id}_resetDDState`] = reset(dispatch, elements);
        window[window.sessionStorage?.tabId][`${id}_saveDDState`] = save(state, id);
        return () => {
            if (saveState) {
                window[window.sessionStorage?.tabId][`${id}_saveDDState`]();
            }
            delete window[window.sessionStorage?.tabId][`${id}_setDDState`];
            delete window[window.sessionStorage?.tabId][`${id}_getDDState`];
            delete window[window.sessionStorage?.tabId][`${id}_resetDDState`];
            delete window[window.sessionStorage?.tabId][`${id}_saveDDState`];
        };
    }, [id, state, dispatch, elements]);

    useEffect(() => {
        createSubscribers(id, subscribers);
        return () => {
            cleanupSubscribers(id, subscribers);
        };
    }, []);

    return {
        state: usableState(state),
    };
};

export default useDropdown;

import { renderHook } from '@testing-library/react-hooks';
import { useLocationChange } from './hooks';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import React from 'react';

const LOCATION_CHANGE = 'LOCATION_CHANGE';

// Mock reducer just records dispatched actions
function reducer(state = { actions: [] }, action) {
  return {
    ...state,
    actions: [...state.actions, action]
  };
}

function setupStore() {
  return createStore(reducer);
}

describe('useLocationChange', () => {
  let store;
  let addEventListenerMock;
  let removeMock;

  beforeEach(() => {
    store = setupStore();

    removeMock = jest.fn();
    addEventListenerMock = jest.fn(() => removeMock);

    global.navigation = {
      addEventListener: addEventListenerMock
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add navigation listener on mount', () => {
    renderHook(() => useLocationChange(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(addEventListenerMock).toHaveBeenCalledWith('navigate', expect.any(Function));
  });

  it('should dispatch LOCATION_CHANGE on navigate event', () => {
    renderHook(() => useLocationChange(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // Get the event handler
    const handler = addEventListenerMock.mock.calls[0][1];

    // Simulate navigation event
    handler({ destination: { url: '/new-page' } });

    const lastAction = store.getState().actions.pop();

    expect(lastAction).toEqual({
      type: LOCATION_CHANGE,
      location: '/new-page'
    });
  });

  it('should remove listener on unmount', () => {
    const { unmount } = renderHook(() => useLocationChange(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    unmount();

    expect(removeMock).toHaveBeenCalled();
  });
});

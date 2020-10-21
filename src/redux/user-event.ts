import { selectDateStart } from './recorder';
import { RootState } from './store';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

export interface UserEvent {
  id: number;
  title: string;
  dateStart: string;
  dateEnd: string;
}

interface UserEventsState {
  byIds: Record<UserEvent['id'], UserEvent>;
  allIds: UserEvent['id'][];
}

const LOAD_REQUEST = 'userEvents/load_request';
const LOAD_SUCCESS = 'userEvents/load_success';
const LOAD_FAILURE = 'userEvents/load_failure';

const CREAT_REQUEST = 'userEvents/create_request';
const CREAT_SUCCESS = 'userEvents/create_success';
const CREAT_FAILURE = 'userEvents/create_failure';

const DELETE_REQUEST = 'userEvents/delete_request';
const DELETE_SUCCESS = 'userEvents/delete_success';
const DELETE_FAILURE = 'userEvents/delete_failure';

const UPDATE_REQUEST = 'userEvents/update_request';
const UPDATE_SUCCESS = 'userEvents/update_success';
const UPDATE_FAILURE = 'userEvents/update_failure';

//Load Actions Interfaces
interface LoadRequestAction extends Action<typeof LOAD_REQUEST> {}
interface LoadSuccessAction extends Action<typeof LOAD_SUCCESS> {
  payload: {
    events: UserEvent[];
  };
}
interface LoadFailureAction extends Action<typeof LOAD_FAILURE> {}

//Create Actions Interfaces
interface CreateRequestAction extends Action<typeof CREAT_REQUEST> {}
interface CreateSuccessAction extends Action<typeof CREAT_SUCCESS> {
  payload: {
    event: UserEvent;
  };
}
interface CreateFailureAction extends Action<typeof CREAT_FAILURE> {}

//Delete Actions Interfaces
interface DeleteRequestAction extends Action<typeof DELETE_REQUEST> {}
interface DeleteSuccessAction extends Action<typeof DELETE_SUCCESS> {
  payload: {
    id: UserEvent['id'];
  };
}
interface DeleteFailureAction extends Action<typeof DELETE_FAILURE> {}

//Update Actions Interfaces
interface UpdateRequestAction extends Action<typeof UPDATE_REQUEST> {}
interface UpdateSuccessAction extends Action<typeof UPDATE_SUCCESS> {
  payload: {
    event: UserEvent;
  };
}
interface UpdateFailureAction extends Action<typeof UPDATE_FAILURE> {}

export const createUserEvents = (): ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  CreateRequestAction | CreateSuccessAction | CreateFailureAction
> => async (dispatch, getState) => {
  dispatch({
    type: CREAT_REQUEST,
  });

  try {
    const dateStart = selectDateStart(getState());
    const event: Omit<UserEvent, 'id'> = {
      title: 'No name',
      dateStart,
      dateEnd: new Date().toISOString(),
    };

    const response = await fetch('http://localhost:3001/events', {
      method: 'POST',
      headers: { 'Content-Type': 'Application/json' },
      body: JSON.stringify(event),
    });

    const createdEvent: UserEvent = await response.json();
    dispatch({
      type: CREAT_SUCCESS,
      payload: {
        event: createdEvent,
      },
    });
  } catch (e) {
    dispatch({
      type: CREAT_FAILURE,
    });
  }
};

export const loadUserEvents = (): ThunkAction<
  void,
  RootState,
  undefined,
  LoadRequestAction | LoadSuccessAction | LoadFailureAction
> => async (dispatch, getState) => {
  dispatch({
    type: LOAD_REQUEST,
  });

  try {
    const response = await fetch('http://localhost:3001/events');
    const events: UserEvent[] = await response.json();
    dispatch({
      type: LOAD_SUCCESS,
      payload: { events },
    });
  } catch (e) {
    dispatch({
      type: LOAD_FAILURE,
    });
  }
};

export const deleteUserEvents = (
  id: UserEvent['id']
): ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  DeleteRequestAction | DeleteSuccessAction | DeleteFailureAction
> => async (dispatch, getState) => {
  dispatch({
    type: DELETE_REQUEST,
  });

  try {
    const response = await fetch(`http://localhost:3001/events/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      dispatch({
        type: DELETE_SUCCESS,
        payload: { id },
      });
    }
  } catch (e) {
    dispatch({
      type: DELETE_FAILURE,
    });
  }
};

export const updateUserEvents = (
  event: UserEvent
): ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  UpdateRequestAction | UpdateSuccessAction | UpdateFailureAction
> => async (dispatch, getState) => {
  dispatch({
    type: UPDATE_REQUEST,
  });

  try {
    const response = await fetch(`http://localhost:3001/events/${event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    const updatedEvent: UserEvent = await response.json();

    dispatch({
      type: UPDATE_SUCCESS,
      payload: {
        event: updatedEvent,
      },
    });
  } catch (e) {
    dispatch({
      type: UPDATE_FAILURE,
    });
  }
};

const selectUserEventsState = (rootState: RootState) => rootState.userEvents;

export const selectUserEventsArray = (rootState: RootState) => {
  const state = selectUserEventsState(rootState);
  return state.allIds.map((id) => state.byIds[id]);
};

const initialState = {
  byIds: {},
  allIds: [],
};

const userEventsReducer = (
  state: UserEventsState = initialState,
  action:
    | LoadSuccessAction
    | CreateSuccessAction
    | DeleteSuccessAction
    | UpdateSuccessAction
) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      const { events } = action.payload;
      return {
        ...state,
        allIds: events.map(({ id }) => id),
        byIds: events.reduce<UserEventsState['byIds']>((byIds, event) => {
          byIds[event.id] = event;
          return byIds;
        }, {}),
      };
    case CREAT_SUCCESS:
      const { event } = action.payload;
      return {
        ...state,
        allIds: [...state.allIds, event.id],
        byIds: { ...state.byIds, [event.id]: event },
      };
    case DELETE_SUCCESS:
      const { id } = action.payload;
      const newState = {
        ...state,
        allIds: state.allIds.filter((storeId) => storeId !== id),
        byIds: { ...state.byIds },
      };
      delete newState.byIds[id];
      console.log('im here');
      return newState;
    case UPDATE_SUCCESS:
      const updatedEvent = action.payload.event;
      return {
        ...state,
        byIds: { ...state.byIds, [updatedEvent.id]: updatedEvent },
      };

    default:
      return state;
  }
};

export default userEventsReducer;

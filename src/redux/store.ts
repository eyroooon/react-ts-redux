import { applyMiddleware, combineReducers, createStore } from 'redux';
import userEventsReducer from './user-event';
import recorderReducer from './recorder';
import thunk from 'redux-thunk';

const rooReducer = combineReducers({
  userEvents: userEventsReducer,
  recorder: recorderReducer,
});

export type RootState = ReturnType<typeof rooReducer>;

const store = createStore(rooReducer, applyMiddleware(thunk));

export default store;

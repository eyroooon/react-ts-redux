import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addZero } from '../../lib/utils';
import {
  deleteUserEvents,
  updateUserEvents,
  UserEvent,
} from '../../redux/user-event';

interface Props {
  event: UserEvent;
}

interface timeProps {
  date: string;
}
const getTime = (date: timeProps['date']) => {
  const propDate = new Date(date);

  let hours = propDate.getHours();

  let minutes = propDate.getMinutes();

  return { hours, minutes };
};

const EventItem: React.FC<Props> = ({ event }) => {
  const dispatch = useDispatch();
  const [isEditable, setEditable] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(event.title);

  const startDate = getTime(event.dateStart);
  const endDate = getTime(event.dateEnd);

  const handleDeleteClick = () => {
    dispatch(deleteUserEvents(event.id));
  };

  const handleClick = () => {
    setEditable(true);
  };

  const handleBlur = () => {
    dispatch(updateUserEvents({ ...event, title }));

    setEditable(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  useEffect(() => {
    if (isEditable) {
      inputRef.current?.focus();
    }
  }, [isEditable]);

  return (
    <div key={event.id} className="calendar-event">
      <div className="calendar-event-info">
        <div className="calendar-event-time">
          {startDate.hours}:{addZero(startDate.minutes)} - {endDate.hours}:
          {addZero(endDate.minutes)}
        </div>
        <div className="calendar-event-title">
          {isEditable ? (
            <input
              onChange={handleChange}
              onBlur={handleBlur}
              ref={inputRef}
              value={title}
              type="text"
            />
          ) : (
            <span onClick={handleClick}>{title}</span>
          )}
        </div>
      </div>
      <button
        onClick={handleDeleteClick}
        className="calendar-event-delete-button"
      >
        &times;
      </button>
    </div>
  );
};

export default EventItem;

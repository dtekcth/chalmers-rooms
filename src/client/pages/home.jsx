import React, { Fragment as F, Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Autosuggest from "react-autosuggest";
import { withRouter, Link } from "react-router-dom";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import TimePicker from "rc-time-picker";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";
import cx from "classnames";
import rp from "request-promise";
import urljoin from "url-join";
import dfns from "date-fns";
import moment from "moment";

import RoomList from "../components/roomlist";
import ProgressBar from "../components/progressbar";

import TimeEdit from "../../timeedit"

const ItemTransition = (props) => (
  <CSSTransition
    {...props}
    classNames="fade"
  />
);

@withRouter
class HomePage extends Component {
  static propTypes = {}

  state = {
    value: "",
    suggestions: [],
    rooms: [],
    freeTimes: [],
    firstSearch: true,
    loading: false,
    progress: 0,
    time: new Date(),
    date: new Date()
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  hasRoom(room) {
    return !!_.find(this.state.rooms, r => r.id == room.id);
  }

  @autobind
  onChange(e, { newValue }) {
    this.setState({
      value: newValue
    });
  }

  @autobind
  onSuggestionsFetchRequested({ value }) {
    rp({
      uri: urljoin(window.location.origin, "/api/v1/rooms"),
      qs: { search: value, max: 10 },
      transform: body => JSON.parse(body)
    }).then(res => {
      if (!res.success) {
        return console.error(res);
      }

      this.setState({
        suggestions: _.filter(res.list, r => !this.hasRoom(r))
      });
    })
  }

  @autobind
  onSuggestionsClearRequested() {
    this.setState({
      suggestions: []
    });
  }

  @autobind
  onSuggestionSelected(e, { suggestion }) {
    if (this.hasRoom(suggestion)) return;

    this.setState({ value: "" });
    this.setState({
      rooms: [
        ...this.state.rooms,
        suggestion
      ]
    });
  }

  @autobind
  onRemoveRoom(e, room) {
    this.setState({
      rooms: _.filter(this.state.rooms, r => r.id != room.id)
    });
  }

  @autobind
  handleAddDRooms() {
    this.setState({
      rooms: _.unionBy(
        this.state.rooms,
        TimeEdit.getDRooms(),
        "id"
      )
    });
  }

  @autobind
  handleDayChange(day) {
    this.setState({
      date: day
    });
  }

  @autobind
  handleTimeChange(time) {
    const date = time.toDate();

    this.setState({
      time: date
    });
  }

  @autobind
  handleSubmit() {
    const { date, rooms } = this.state;

    const str = _.chain(rooms)
                 .map(r => r.id)
                 .join(",")
                 .value();

    this.setState({
      freeTimes: [],
      loading: true,
      progress: 0
    });

    const roomLookup = {};
    _.each(this.state.rooms, r => {
      roomLookup[r.id] = r;
    });

    setTimeout(() => {
      if (this.unmounted) return;

      rp({
        uri: urljoin(window.location.origin, "/api/v1/rooms/times"),
        qs: { rooms: str, date },
        transform: body => JSON.parse(body)
      }).then(res => {
        if (!res.success) {
          return console.error(res);
        }

        this.setState({
          freeTimes: _.map(res.list, t => {
            return {
              ...t,
              room: roomLookup[t.roomId],
            };
          }),
          firstSearch: false,
          progress: 100
        });

        setTimeout(() => {
          if (this.unmounted) return;

          this.setState({
            loading: false
          })
        }, 500);

        setTimeout(() => {
          if (this.unmounted) return;

          this.setState({
            progress: 0
          })
        }, 700);
      }).catch(e => {
        console.error(e);
      });
    }, 500);
  }

  @autobind
  renderSuggestion(s) {
    return (
      <div className="bg-red p-1">{s}</div>
    );
  }

  render() {
    const { value, suggestions } = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      value,
      onChange: this.onChange,
      placeholder: "Search for rooms..."
    };

    const filtered = _
      .chain(this.state.freeTimes)
      .sortBy(t => t.range.start)
      .filter(t => {
        const end = new Date(t.range.end);

        const h = end.getHours();
        const m = end.getMinutes();

        const d = this.state.time;

        return m + h * 60 >= d.getMinutes() + d.getHours() * 60;
      })
      .value();

    const freeTimesElems = _
      .map(filtered, (t, i) => {
        const room = t.room;
        const day = dfns.format(t.range.start, "ddd D MMM");
        const start = dfns.format(t.range.start, "HH:mm");
        const end = dfns.format(t.range.end, "HH:mm");

        const delay = i * 100;
        return (
          <CSSTransition
            classNames="fade"
            key={t.roomId + "-" + start + "-" + end}
            timeout={500}
          >
            <div className="item-transition" style={{ animationDelay: delay + "ms" }}>
              <div
                className="mx-3 p-3 bg-white rounded shadow-lg mt-2"
              >
                <div className="uppercase font-bold flex justify-between">
                  <div className="text-grey-dark">{room.name}</div>
                  <div className="text-grey">{day}</div>
                </div>

                <div className="text-grey-dark font-bold mt-1">
                  <span className="uppercase text-dtek">{start}</span>
                  <span>&nbsp;to&nbsp;</span>
                  <span className="uppercase text-dtek">{end}</span>
                </div>
              </div>
            </div>
          </CSSTransition>
        );
      });

    let listContainer = (
      <div className="text-grey mt-3 text-center font-bold ">
        Press the button above to find some free rooms!
      </div>
    );

    if (freeTimesElems.length > 0) {
    }
    else if (!this.state.loading && !this.state.firstSearch) {
      listContainer = (
        <div className="text-grey-dark mt-3 text-center font-bold ">
          There's no free rooms available at the chosen time.
        </div>
      );
    }

    return (
      <div className="min-h-screen pb-7 relative">
        <header className="bg-dtek flex items-center justify-center">
          <h1 className="block text-white text-center title text-3xl sm:text-4xl">
            <FontAwesomeIcon icon={["far", "calendar-alt"]} />

            <span className="ml-2">
              Chalmers Group Rooms
            </span>
          </h1>
        </header>

        <div className="page-content mx-auto w-full max-w-md">
          <div className="mx-3 bg-white rounded shadow-lg">
            <div className="p-3">
              <div className="styled-autosuggest">
                <Autosuggest
                  suggestions={suggestions}
                  highlightFirstSuggestion
                  onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                  onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                  onSuggestionSelected={this.onSuggestionSelected}
                  getSuggestionValue={s => s.name}
                  renderSuggestion={s => s.name}
                  inputProps={inputProps}
                />
              </div>

              <div className="bg-grey-lighter shadow rounded p-3 mt-3">
                <RoomList
                  rooms={this.state.rooms}
                  onRemoveRoom={this.onRemoveRoom}
                />
              </div>

              <button
                className="button-dtek w-full mt-3"
                onClick={this.handleAddDRooms}
              >
                Add all D rooms
              </button>

              <div className="mt-3 sm:flex sm:justify-between">
                <DayPickerInput
                  classNames={{
                    container: "DayPickerInput w-full sm:w-auto",
                    overlayWrapper: "DayPickerInput-OverlayWrapper",
                    overlay: "DayPickerInput-Overlay"
                  }}
                  onDayChange={this.handleDayChange}
                  placeholder="YYYY-MM-DD"
                  value={this.state.date}
                />

                <TimePicker
                  className="w-full sm:w-auto mt-3 sm:mt-0"
                  showSecond={false}
                  minuteStep={5}
                  defaultValue={moment(this.state.time)}
                  onChange={this.handleTimeChange}
                  allowEmpty={false}
                />
              </div>

              <div className="mt-3 flex justify-center">
                <button
                  className="button-dtek w-full"
                  onClick={this.handleSubmit}
                >
                  Find free times!
                </button>
              </div>
            </div>

            <div className="progress active h-2">
              <ProgressBar
                className={
                  cx("transition-opacity flex justify-center",
                     this.state.loading ? "opacity-100" : "opacity-0")
                }
                value={this.state.progress}
              />
            </div>
          </div>

          {listContainer}

          <TransitionGroup>
            {freeTimesElems}
          </TransitionGroup>
        </div>

        <div className="absolute text-center text-grey pin-b pin-x mb-2">
          <a
            href="https://github.com/dtekcth/chalmers-rooms"
            target="_blank"
          >
            <FontAwesomeIcon icon={["fab", "github"]} />
            <span className="ml-1">
              Find me on Github!
            </span>
          </a>
        </div>
      </div>
    );
  }
}

export default HomePage

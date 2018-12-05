import _ from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { PureComponent } from "react";
import cx from "classnames";

import IconButton from "./iconbutton";

export default class RoomList extends PureComponent {
  render() {
    if (this.props.rooms.length === 0) {
      return (
        <div className="text-grey-dark font-bold uppercase">
          {this.props.placeholder || "No rooms selected!"}
        </div>
      );
    }

    const elems = _
      .chain(this.props.rooms)
      .sortBy(r => r.name)
      .reverse()
      .map((r, i) => {
        return (
          <div
            key={i}
            className={
              cx("max-w-full sm:max-w-half flex-grow inline-block",
                 "bg-dtek text-white rounded shadow",
                 "font-bold uppercase text-sm sm:text-base",
                 "mr-1 mb-1 w-full sm:w-auto pl-2 pr-1 py-1")
            }
          >
            <div className="flex justify-between items-center">
              <span>{r.name}</span>

              <IconButton
                size="6"
                className="ml-1"
                textColor="white"
                hoverBackground="dtek-dark"
                hoverText="dtek"
                icon="times"

                onClick={
                  e => {
                    this.props.onRemoveRoom && this.props.onRemoveRoom(e, r);
                  }
                }
              />
            </div>
          </div>
        );
      })
      .value();

    return (
      <div className="-mb-2 flex flex-wrap">
        {elems}
      </div>
    );
  }
}
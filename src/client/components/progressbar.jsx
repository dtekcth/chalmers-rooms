import React, { PureComponent } from "react";
import propTypes from "prop-types";
import cx from "classnames";

class ProgressBar extends PureComponent {
  static propTypes = {
    value    : propTypes.number,
    height   : propTypes.number,
    color    : propTypes.string,
    striped  : propTypes.bool,
    animated : propTypes.bool,
  }

  static defaultProps = {
    color: "dtek",
  }
  
  render() {
    const props = this.props;

    return (
      <div
        className={
          cx("progress active", props.className)
        }
        style={{ height: props.height }}
      >
        <div
          className={
            cx("progress-bar rounded",
               props.barClassName,
               props.striped && "progress-bar-striped",
               props.animated && "progress-bar-animated",
               props.color && "bg-" + props.color)
          }
          role="progressbar"
          style={{ width: props.value + "%", maxWidth: props.value + "%" }}
          aria-valuenow={props.value}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    )
  }
}

export default ProgressBar;
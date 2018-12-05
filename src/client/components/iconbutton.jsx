import _ from "lodash";
import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import PropTypes from "prop-types";

class IconButton extends Component {
  static propTypes = {
    icon            : PropTypes.string.isRequired,
    type            : PropTypes.string,
    size            : PropTypes.string,
    className       : PropTypes.string,
    textColor       : PropTypes.string,
    background      : PropTypes.string,
    hoverText       : PropTypes.string,
    hoverBackground : PropTypes.string,
    component       : PropTypes.func,
  }

  render() {
    const { props } = this;

    const Comp = props.component || "button";
    const p = _.omit(props, [
      "type", "component", "className", "icon", "size",
      "textColor", "background", "hoverText", "hoverBackground"
    ]);

    return (
      <Comp
        type={Comp == "button" ? props.type || "button" : props.type}
        className={
          cx("inline-flex justify-center items-center",
             `w-${props.size || 6} h-${props.size || 6}`,
             "rounded-full transition-colors bg-transparent",
             props.background && `bg-${props.hoverBackground}`,
             `hover:bg-${props.hoverBackground || "red"}`,
             `text-${props.textColor || "red"}`,
             `hover:text-${props.hoverText || "white"}`, props.className)
        }
        {...p}
      >
        <FontAwesomeIcon icon={props.icon} fixedWidth size={props.iconSize || "xs"} />
      </Comp>
    );
  }
}

export default IconButton;

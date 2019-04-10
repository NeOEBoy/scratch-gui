import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import arrowFlagIcon from './icon-arrow-flag.svg';
import styles from './arrow-flag.css';

const ArrowFlagComponent = function (props) {
    const {
        active,
        className,
        onClick,
        title,
        ...componentProps
    } = props;
    return (
        <img
            className={classNames(
                className,
                styles.arrowFlag,
                {
                    [styles.isActive]: active
                }
            )}
            draggable={false}
            src={arrowFlagIcon}
            title={title}
            onClick={onClick}
            {...componentProps}
        />
    );
};
ArrowFlagComponent.propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string
};
ArrowFlagComponent.defaultProps = {
    active: false,
    title: '弹出操作杆'
};
export default ArrowFlagComponent;

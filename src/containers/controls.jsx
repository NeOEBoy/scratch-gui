import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import { connect } from 'react-redux';

import ControlsComponent from '../components/controls/controls.jsx';

import nipplejs from 'nipplejs';

class Controls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      arrowFlagActive: false
    };
    bindAll(this, [
      'handleGreenFlagClick',
      'handleStopAllClick',
      'handleArrowFlagClick',
      'handleDirectionChange',
      'handlSpaceClick'
    ]);
  }
  componentDidMount() {
    console.log('Controls componentDidMount');
  }
  componentWillUnmount() {
    this.nipple && this.nipple.destroy();
    this.nipple = null;
  }
  handleDirectionChange(evt, data) {
    let angle = data.direction.angle;
    if (angle === 'up') {
      this._postKeyboardData(38, 'ArrowUp', true);
    } else if (angle === 'down') {
      this._postKeyboardData(40, 'ArrowDown', true);
    } else if (angle === 'left') {
      this._postKeyboardData(37, 'ArrowLeft', true);
    } else if (angle === 'right') {
      this._postKeyboardData(39, 'ArrowRight', true);
    }
  }
  handlSpaceClick() {
    this._postKeyboardData(32, ' ', true);
  }
  _postKeyboardData(keyCode, key, isDown) {
    this.props.vm.postIOData('keyboard', {
      keyCode: keyCode,
      key: key,
      isDown: isDown
    });
  }
  handleGreenFlagClick(e) {
    e.preventDefault();
    if (e.shiftKey) {
      this.props.vm.setTurboMode(!this.props.turbo);
    } else {
      if (!this.props.isStarted) {
        this.props.vm.start();
      }
      this.props.vm.greenFlag();
    }
  }
  handleStopAllClick(e) {
    e.preventDefault();
    this.props.vm.stopAll();
  }
  handleArrowFlagClick(e) {
    e.preventDefault();
    this.setState({
      arrowFlagActive: !this.state.arrowFlagActive
    });

    // 避免this.theControlDiv还没有创建
    setTimeout(() => {
      if (!this.nipple && this.state.arrowFlagActive) {
        this.nipple = nipplejs.create({
          zone: this.theControlDiv,
          mode: 'static',
          position: { left: '50%', bottom: '50%' },
          color: 'rgb(255,171,25)',
          restOpacity: 1
        });
        this.nipple.on('dir:up, dir:down, dir:left, dir:right', this.handleDirectionChange);
      } else if (this.nipple && !this.state.arrowFlagActive) {
        this.nipple && this.nipple.destroy();
        this.nipple = null;
      }
    }, 0);
  }
  render() {
    const {
      vm, // eslint-disable-line no-unused-vars
      isStarted, // eslint-disable-line no-unused-vars
      projectRunning,
      turbo,
      ...props
    } = this.props;
    const { arrowFlagActive } = this.state;
    return (
      <div>
        <ControlsComponent
          {...props}
          active={projectRunning}
          arrowFlagActive={arrowFlagActive}
          turbo={turbo}
          onGreenFlagClick={this.handleGreenFlagClick}
          onStopAllClick={this.handleStopAllClick}
          onArrowFlagClick={this.handleArrowFlagClick}
        />

        {/* 加入虚拟键盘控制栏-neo */}
        <div style=
          {Object.assign({}, KStyles.arrowFlagDivDefault, arrowFlagActive && KStyles.arrowFlagDivActive)}>
          <div style=
            {{
              width: 200, height: 200, position: 'absolute', left: 0,
            }}
            ref={(theControlDiv) => {
              this.theControlDiv = theControlDiv;
            }}>
          </div>

          <div style=
            {{
              width: 200, height: 200, position: 'absolute', right: 0
            }}>

            <svg style=
              {{
                width: 200, height: 200, position: 'absolute',
                left: 0, top: 0, right: 0, bottom: 0
              }}>
              <circle cx="100" cy="100" r="50" fill="rgba(230,77,0, 0.5)"
                onClick={this.handlSpaceClick}>
              </circle>
            </svg>

            <h3 style=
              {{
                width: 200, height: 200, textAlign: "center",
                verticalAlign: 'middle', display: 'table-cell',
                contentEditable: false
              }}>
              Space
                  </h3>
          </div>
        </div>
      </div>
    );
  }
}

const KStyles = {
  arrowFlagDivDefault: {
    height: 200,
    backgroundColor: 'rgba(76, 151, 255, 0.85)',
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: -200,
    zIndex: 20122211,
    // 属性动画，all表示将Active的属性全部设置动画，目前只有bottom
    transition: '0.15s all'
  },
  // 激活时的属性变化
  arrowFlagDivActive: {
    bottom: 0,
  }
}
Controls.propTypes = {
  isStarted: PropTypes.bool.isRequired,
  projectRunning: PropTypes.bool.isRequired,
  turbo: PropTypes.bool.isRequired,
  vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({
  isStarted: state.scratchGui.vmStatus.running,
  projectRunning: state.scratchGui.vmStatus.running,
  turbo: state.scratchGui.vmStatus.turbo
});
// no-op function to prevent dispatch prop being passed to component
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Controls);

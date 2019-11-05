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
      'handleNippleStart',
      'handleNippleEnd',
      'handleNippleDirection',
      'handleSpaceDown',
      'handleSpaceUp',
      '_handleDown',
      '_handleUp',
      'doArrowFlagActiveTrueIfWechat',
      'doArrowFlagActiveIfWechat',
      'doArrowFlagActive'
    ]);
  }
  componentDidMount() {
    // console.log('controls componentDidMount');
    this.props.vm.on(
      'RUNTIME_STARTED', this.doArrowFlagActiveTrueIfWechat);
  }
  componentWillUnmount() {
    // console.log('controls componentWillUnmount');

    this.props.vm.removeListener(
      'RUNTIME_STARTED', this.doArrowFlagActiveTrueIfWechat);

    this.nipple && this.nipple.destroy();
    this.nipple = null;
    this._longPressTimer && clearTimeout(this._longPressTimer);
    this._longPressTimer = null;
  }
  handleNippleStart(evt, data) {
    // do nothing
    // evt.preventDefault();
  }
  handleNippleEnd(evt, data) {
    // evt.preventDefault();
    if (this._lastDirectInfo) {
      this._handleUp(this._lastDirectInfo.keyCode, this._lastDirectInfo.key);
      this._lastDirectInfo = null;
    }
  }
  handleNippleDirection(evt, data) {
    let angle = data.direction.angle;

    let keyCode;
    let key;
    if (angle === 'up') {
      keyCode = 38;
      key = 'ArrowUp';
    } else if (angle === 'down') {
      keyCode = 40;
      key = 'ArrowDown';
    } else if (angle === 'left') {
      keyCode = 37;
      key = 'ArrowLeft';
    } else if (angle === 'right') {
      keyCode = 39;
      key = 'ArrowRight';
    }

    if (this._lastDirectInfo) {
      this._handleUp(this._lastDirectInfo.keyCode, this._lastDirectInfo.key);
      this._lastDirectInfo = null;
    }

    this._lastDirectInfo = { keyCode: keyCode, key: key };
    this._handleDown(keyCode, key);

    return false;
  }
  handleSpaceDown() {
    this._handleDown(32, ' ');
  }
  handleSpaceUp() {
    this._handleUp(32, ' ');
  }
  _handleDown(keyCode, key) {
    this._postKeyboardData(keyCode, key, true);

    this._longPressTimer && clearTimeout(this._longPressTimer);
    this._longPressTimer = null;
    this._longPressTimer = setTimeout(() => {
      this._longPressTimer && clearTimeout(this._longPressTimer);
      this._longPressTimer = null;

      this._longPressTimer = setInterval(() => {
        this._postKeyboardData(keyCode, key, true);
      }, 30);
    }, 300);
  }
  _handleUp(keyCode, key) {
    this._postKeyboardData(keyCode, key, false);

    this._longPressTimer && clearTimeout(this._longPressTimer);
    this._longPressTimer = null;
  }

  _postKeyboardData(keyCode, key, isDown) {
    this.props.vm.postIOData('keyboard', {
      keyCode: keyCode,
      key: key,
      isDown: isDown
    });
  }
  _is_weixin() {
    // return true;
    let ua = navigator.userAgent.toLowerCase();
    return ua.match(/MicroMessenger/i) == "micromessenger";
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

      // 微信中启动后，直接弹出操作杆
      this.doArrowFlagActiveIfWechat(true);
    }
  }
  handleStopAllClick(e) {
    e.preventDefault();
    this.props.vm.stopAll();

    // 微信中启动后，直接关闭操作杆
    this.doArrowFlagActiveIfWechat(false);
  }
  handleArrowFlagClick(e) {
    e.preventDefault();

    this.doArrowFlagActive(!this.state.arrowFlagActive);
  }

  doArrowFlagActiveTrueIfWechat() {
    // console.log('controls doArrowFlagActiveTrueIfWechat');

    this.doArrowFlagActiveIfWechat(true);
  }
  doArrowFlagActiveIfWechat(active) {
    if (this._is_weixin()) {
      this.doArrowFlagActive(active);
    }
  }

  doArrowFlagActive(active) {
    this.setState({
      arrowFlagActive: active
    }, () => {
      // 避免position出错
      setTimeout(() => {
        if (!this.nipple && this.state.arrowFlagActive) {
          this.nipple && this.nipple.destroy();
          this.nipple = nipplejs.create({
            zone: this.theControlDiv,
            mode: 'static',
            position: { left: '100px', bottom: '100px' },
            color: 'rgb(255,171,25)',
            size: 100,
            restOpacity: 1
          });
          this.nipple
            .on('dir:up, dir:down, dir:left, dir:right', this.handleNippleDirection)
            .on('start', this.handleNippleStart)
            .on('end', this.handleNippleEnd);
        } else if (this.nipple && !this.state.arrowFlagActive) {
          this.nipple && this.nipple.destroy();
          this.nipple = null;
        }
      }, 500);
    });
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
              width: 200, height: 200, position: 'absolute', left: 0
            }}
            ref={(theControlDiv) => {
              this.theControlDiv = theControlDiv;
            }}>

            <img src={require('./crossroads-arrows.png')}
              style={{ marginLeft: 55, marginTop: 55, width: 90, height: 90, userSelect: "none" }}></img>
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
                onMouseDown={this.handleSpaceDown}
                onMouseUp={this.handleSpaceUp}
                onTouchStart={this.handleSpaceDown}
                onTouchEnd={this.handleSpaceUp}>
              </circle>
            </svg>

            <h3 style=
              {{
                width: 200, height: 200, textAlign: "center",
                verticalAlign: 'middle', display: 'table-cell',
                contentEditable: false, userSelect: "none"
              }}>
              空格
                  </h3>
          </div>

          <div style={{ position: 'absolute', right: 0, width: 24, height: 24, marginRight: 4, marginTop: 4 }} onClick={this.handleArrowFlagClick}>
            <img src={require('./close.svg')} style={{ width: 24, height: 24, userSelect: "none" }} />
          </div>

          <div style={{ color: 'white', fontSize: 12, marginTop: 4, marginLeft: 4 }}>
            虚拟手柄(左边方向按键，右边空格按键)
          </div>
        </div>
      </div>
    );
  }
}

const KStyles = {
  arrowFlagDivDefault: {
    height: 200,
    // 放开背景
    backgroundColor: 'rgba(76, 151, 255, 0.95)',
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: -200,
    zIndex: 20122211,
    // 属性动画，all表示将Active的属性全部设置动画，目前只有bottom
    transition: '0.3s all'
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

import bindAll from 'lodash.bindall';
import omit from 'lodash.omit';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import ThrottledPropertyHOC from '../lib/throttled-property-hoc.jsx';

import VM from 'scratch-vm';
import storage from '../lib/storage';
import getCostumeUrl from '../lib/get-costume-url';

import WatermarkComponent from '../components/watermark/watermark.jsx';

class Watermark extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'getCostumeData'
        ]);
        this.state = {
          costumeData: null
        }
    }

    componentDidMount() {
      this.getCostumeData();
    }

    getCostumeData () {
        if (!this.props.asset) {
          this.setState({costumeData: null});
          return;
        };

        getCostumeUrl(this.props.asset).then((data)=>{
          this.setState({costumeData: data});
        });
    }

    render () {
        const componentProps = omit(this.props, ['asset', 'vm']);
        const {costumeData} = this.state;
        return (
            <WatermarkComponent
                costumeURL={costumeData}
                {...componentProps}
            />
        );
    }
}

Watermark.propTypes = {
    asset: PropTypes.instanceOf(storage.Asset),
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => {
    const targets = state.scratchGui.targets;
    const currentTargetId = targets.editingTarget;

    let asset;
    if (currentTargetId) {
        if (targets.stage.id === currentTargetId) {
            asset = targets.stage.costume.asset;
        } else if (targets.sprites.hasOwnProperty(currentTargetId)) {
            const currentSprite = targets.sprites[currentTargetId];
            asset = currentSprite.costume.asset;
        }
    }

    return {
        vm: state.scratchGui.vm,
        asset: asset
    };
};

const ConnectedComponent = connect(
    mapStateToProps
)(
    ThrottledPropertyHOC('asset', 500)(Watermark)
);

export default ConnectedComponent;

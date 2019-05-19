import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';
import VM from 'scratch-vm';

import randomizeSpritePosition from '../lib/randomize-sprite-position';

import LibraryComponent from '../components/library/library.jsx';

const messages = defineMessages({
    libraryTitle: {
        defaultMessage: 'Choose a Sprite',
        description: 'Heading for the sprite library',
        id: 'gui.spriteLibrary.chooseASprite'
    }
});

class SpriteLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect'
        ]);
        this.state = {
          libraryContent: [],
          tags: []
        }
    }
    componentDidMount() {
      const spriteTags = require('../lib/libraries/sprite-tags').default;
      this.setState({
        tags: spriteTags
      });

      process.nextTick(() => {
        const spriteLibraryContent = require('../lib/libraries/sprites.json');
        this.setState({
          libraryContent: spriteLibraryContent
        });
      })
    }
    handleItemSelect (item) {
        // Randomize position of library sprite
        randomizeSpritePosition(item);
        this.props.vm.addSprite(JSON.stringify(item.json)).then(() => {
            this.props.onActivateBlocksTab();
        });
    }
    render () {
        const { libraryContent, tags } = this.state;
        return (
            <LibraryComponent
                data={libraryContent}
                id="spriteLibrary"
                tags={tags}
                title={this.props.intl.formatMessage(messages.libraryTitle)}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

SpriteLibrary.propTypes = {
    intl: intlShape.isRequired,
    onActivateBlocksTab: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(SpriteLibrary);

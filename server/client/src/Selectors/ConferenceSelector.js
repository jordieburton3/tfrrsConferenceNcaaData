import React from 'react';
import { AppContext } from '../DataStore';
import { ConfigSelect } from '../Components/ConfigSelect';

class ConferenceSelector extends React.PureComponent {
    render() {
        const { conferences, onChange } = this.props;
        const options = conferences.map((conference) => ({ value: conference, label: conference }));
        return (
            <div>
                <ConfigSelect
                    placeholder="Select conference/s" 
                    options={options} 
                    onChange={onChange} 
                    isMulti/>
            </div>
        )
    }
}

export class ConnectedConferenceSelector extends React.PureComponent {
    render() {
        return (
            <AppContext.Consumer>
                {({ state, actions }) => (
                    <ConferenceSelector 
                        conferences={state.conferences} 
                        onChange={actions.conferenceSelectorOnChange}/>
                )}
            </AppContext.Consumer>
        )
    }
}


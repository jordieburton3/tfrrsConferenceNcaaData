import React from 'react';
import { AppContext } from '../DataStore';
import { ConfigSelect } from '../Components/ConfigSelect';

class EventSelector extends React.PureComponent {
    render() {
        const { onChange, seasons, events } = this.props;
        const options = events.filter((o) => seasons
            .includes(o.season))
            .map((o) => ({ value: o.event, label: o.event }));
        return (
            <div>
                <ConfigSelect
                    options={options} 
                    onChange={onChange} 
                    isMulti
                    placeholder="Select season/s"/>
            </div>
        )
    }
}

export class ConnectedSchoolSelector extends React.PureComponent {
    render() {
        return (
            <AppContext.Consumer>
                {({ state, actions }) => (
                    <EventSelector
                        seasons={state.seasons}
                        events={state.eventInfo}
                        onChange={(e) => console.log(e)}/>
                )}
            </AppContext.Consumer>
        )
    }
}


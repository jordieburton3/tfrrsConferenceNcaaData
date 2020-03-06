import React from 'react';
import Select from 'react-select';
import { AppContext, DataStore } from '../DataStore';
import { ConnectedConferenceSelector } from '../Selectors/ConferenceSelector';
import { ConnectedSchoolSelector } from '../Selectors/SchoolSelector';

class MeetDataSection extends React.PureComponent {
    render() {
        const { selectedConferences } = this.props;
        return (
            <div>
                <ConnectedConferenceSelector />
                {selectedConferences.length > 0 &&
                    <ConnectedSchoolSelector />}
            </div>
        )
    }
}

export class ConnectedMeetDataSection extends React.PureComponent {
    render() {
        return (
            <AppContext>
                {(context) => {
                    const { selectedConferences } = context.state;
                    return (
                        <MeetDataSection selectedConferences={selectedConferences}/>
                    );
                }}
            </AppContext>
        );
    }
}
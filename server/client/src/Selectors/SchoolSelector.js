import React from 'react';
import { AppContext } from '../DataStore';
import { ConfigSelect } from '../Components/ConfigSelect';

class SchoolSelector extends React.PureComponent {
    render() {
        const { availableSchools, onChange } = this.props;
        const options = availableSchools.map((s) => ({ value: s, label: s }));
        return (
            <div>
                <ConfigSelect
                    options={options} 
                    onChange={onChange} 
                    isMulti
                    placeholder="Select school/s"/>
            </div>
        )
    }
}

export class ConnectedSchoolSelector extends React.PureComponent {
    render() {
        return (
            <AppContext.Consumer>
                {({ state, actions }) => (
                    <SchoolSelector
                        availableSchools={state.schoolInfo
                            .filter((school) => state.selectedConferences.includes(school.conference))
                            .map((school) => school.school)} 
                        onChange={(e) => console.log(e)}/>
                )}
            </AppContext.Consumer>
        )
    }
}


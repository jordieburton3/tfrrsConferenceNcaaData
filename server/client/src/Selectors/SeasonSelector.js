import React from 'react';
import { AppContext } from '../DataStore';
import { ConfigSelect } from '../Components/ConfigSelect';

class SeasonSelector extends React.PureComponent {
    render() {
        const { onChange } = this.props;
        const options = [{ value: 'indoor', label: 'indoor' }, { value: 'outdoor', label: 'outdoor' }];
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
                    <SeasonSelector
                        onChange={(e) => console.log(e)}/>
                )}
            </AppContext.Consumer>
        )
    }
}


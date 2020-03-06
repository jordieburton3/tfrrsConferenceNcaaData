import React from 'react';
import { AppContext } from '../DataStore';
import { ConfigSelect } from '../Components/ConfigSelect';

class GenderSelector extends React.PureComponent {
    render() {
        const { onChange } = this.props;
        const options = [{ value: "M", label: "Men" }, { value: "W", label: "Women" }];
        return (
            <div>
                <ConfigSelect
                    options={options} 
                    onChange={onChange} 
                    isMulti
                    placeholder="Select gender/s"/>
            </div>
        )
    }
}

export class ConnectedGenderSelector extends React.PureComponent {
    render() {
        return (
            <AppContext.Consumer>
                {({ state, actions }) => (
                    <GenderSelector
                        onChange={(e) => console.log(e)}/>
                )}
            </AppContext.Consumer>
        )
    }
}


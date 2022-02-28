import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList } from 'react-window';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';

function getCountriesFromList(users) {
    let updatedCountries = [];
    updatedCountries.concat(users.slice());
    users.map(user => {
        if (!updatedCountries?.includes(user.location.country)) {
            updatedCountries.push(user.location.country);
        }
    });
    return updatedCountries;
}

function getUsersForCountries(users, value) {
    var filteredEvents = users.filter(item => item.location.country.includes(value));
    return filteredEvents;
}

function UsersComponent() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    const [countries, setCountries] = useState([]);
    const [usersInCountry, setUsersInCountry] = useState([]);
    const [value, setValue] = useState('');
    const [refresh, setRefresh] = useState(true);

    useEffect(() => {
        if (refresh) {
            console.log('refreshing');
            setIsLoaded(false);
            fetch("http://localhost:8080/randomusers/users")
                .then(res => res.json())
                .then(
                    (result) => {
                        setIsLoaded(true);
                        setItems(result._embedded.users);
                        setCountries(getCountriesFromList(result._embedded.users));
                        setUsersInCountry(getUsersForCountries(items, value));
                        setRefresh(false);
                        console.log('fetched users count ' + items.length);
                    },
                    (error) => {
                        setIsLoaded(true);
                        setError(error);
                        setRefresh(false);
                    }
                )
        }
    }, [refresh])

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading...</div>;
    } else {
        return (
            <div style={{ marginLeft: '5%', marginTop: '60px' }}>
                <Autocomplete
                    options={countries}
                    style={{ width: 300 }}
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                        setUsersInCountry(getUsersForCountries(items, newValue));
                        setRefresh(false);
                    }}
                    renderInput={(params) =>
                        <TextField {...params} label="Countries" variant="outlined" />}
                />
              
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => setRefresh(true)}>
                    Refresh data
                </Button>
                <Box
                    sx={{ width: '100%', height: 800, maxWidth: 1000, bgcolor: 'background.paper' }}
                >
                    <FixedSizeList
                        height={800}
                        width={700}
                        itemSize={46}
                        itemCount={usersInCountry.length > 0 ? usersInCountry.length : items.length}
                        overscanCount={10}
                    >
                        {({ index, style }) => {
                            let item = usersInCountry[index] ? usersInCountry[index] : items[index];
                            return (
                                <ListItem style={style} key={index} disablePadding>
                                    <ListItemText primary={`${item.name.title} ${item.name.first} ${item.name.last} ${item.gender} ${item.email} `} />
                                </ListItem>
                            );
                        }}
                    </FixedSizeList>
                </Box>
            </div>
        );
    }
}

ReactDOM.render(
    <UsersComponent />,
    document.getElementById('root')
);

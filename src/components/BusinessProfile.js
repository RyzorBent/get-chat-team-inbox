import React, {useEffect, useMemo, useRef, useState} from "react";
import '../styles/BusinessProfile.css';
import {Avatar, Button, FormControl, IconButton, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import {ArrowBack} from "@material-ui/icons";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";
import FileInput from "./FileInput";
import {avatarStyles} from "../AvatarStyles";

function BusinessProfile(props) {

    const [isLoaded, setLoaded] = useState(false);
    const [isUpdating, setUpdating] = useState(false);
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');
    const [vertical, setVertical] = useState('');
    const [websites, setWebsites] = useState({});
    const [about, setAbout] = useState('');
    const [profilePhoto, setProfilePhoto] = useState();

    const fileInput = useRef();

    const cancelTokenSourceRef = useRef();

    const avatarClasses = avatarStyles();

    useEffect(() => {
        // Generate a token
        cancelTokenSourceRef.current = axios.CancelToken.source();

        getBusinessProfile();

        return () => {
            cancelTokenSourceRef.current.cancel();
        }
    }, []);

    const getBusinessProfile = () => {
        axios.get(`${BASE_URL}settings/business/profile/`, getConfig(undefined, cancelTokenSourceRef.current.token))
            .then((response) => {
                console.log(response.data);

                const data = response.data;

                setAddress(data.address);
                setDescription(data.description);
                setEmail(data.email);
                setVertical(data.vertical);

                let websitesArray = data.websites;
                if (websitesArray.length === 0) {
                    websitesArray = [""];
                }

                setWebsites({...websitesArray});

                // Load about
                getAbout();

            })
            .catch((error) => {
                console.log(error);

                props.displayError(error);
            });
    }

    const updateBusinessProfile = async event => {
        event.preventDefault();

        setUpdating(true);

        axios.patch( `${BASE_URL}settings/business/profile/`, {
            address: address,
            description: description,
            email: email,
            vertical: vertical,
            websites: Object.values(websites)
        }, getConfig())
            .then((response) => {
                console.log(response.data);

                // Update about
                updateAbout(event);

            })
            .catch((error) => {
                console.log(error);

                setUpdating(false);

                props.displayError(error);
            });
    }

    const getAbout = () => {
        axios.get(`${BASE_URL}settings/profile/about/`, getConfig(undefined, cancelTokenSourceRef.current.token))
            .then((response) => {
                console.log(response.data);

                const profile = response.data.settings?.profile;

                setAbout(profile?.about?.text);

                getProfilePhoto();

            })
            .catch((error) => {
                console.log(error);

                props.displayError(error);
            });
    }

    const updateAbout = async event => {
        event.preventDefault();

        axios.patch( `${BASE_URL}settings/profile/about/`, {
            text: about
        }, getConfig())
            .then((response) => {
                console.log(response.data);

                setUpdating(false);

            })
            .catch((error) => {
                console.log(error);

                setUpdating(false);

                props.displayError(error);
            });
    }

    const getProfilePhoto = () => {
        axios.get(`${BASE_URL}settings/profile/photo/`, getConfig(undefined, cancelTokenSourceRef.current.token, 'arraybuffer'))
            .then((response) => {
                const base64 = Buffer.from(response.data, 'binary').toString('base64');
                setProfilePhoto(base64);

                setLoaded(true);
            })
            .catch((error) => {
                console.log(error);

                props.displayError(error);
            });
    }

    const updateProfilePhoto = async (file) => {
        const formData = new FormData();
        formData.append("file_encoded", file[0]);

        axios.post( `${BASE_URL}settings/profile/photo/`, formData, getConfig(undefined, cancelTokenSourceRef.current.token))
            .then((response) => {
                console.log(response.data);

                setUpdating(false);

                // Display new photo
                getProfilePhoto();

            })
            .catch((error) => {
                console.log(error);

                setUpdating(false);

                props.displayError(error);
            });
    }

    const verticalOptions = [
        "Automotive", "Beauty, Spa and Salon",
        "Clothing and Apparel",
        "Education",
        "Entertainment",
        "Event Planning and Service",
        "Finance and Banking",
        "Food and Grocery",
        "Public Service",
        "Hotel and Lodging",
        "Medical and Health",
        "Non-profit",
        "Professional Services",
        "Shopping and Retail",
        "Travel and Transportation",
        "Restaurant",
        "Other"
    ];

    const handleBusinessProfileAvatarClick = () => {
        if (props.isAdmin) fileInput.current.click();
    }

    return(
        <div className="sidebarBusinessProfile">
            <div className="sidebarBusinessProfile__header">
                <IconButton onClick={props.onHide}>
                    <ArrowBack />
                </IconButton>

                <h3>Profile</h3>
            </div>

            <div className="sidebarBusinessProfile__body">
                <div className="sidebarBusinessProfile__body__section">
                    {props.currentUser &&
                    <div>
                        <div className="sidebarBusinessProfile__body__avatarContainer">
                            <Avatar className={avatarClasses[props.currentUser.username[0].toUpperCase()]}>{props.currentUser.username[0].toUpperCase()}</Avatar>
                        </div>

                        <h3>{props.currentUser.username}</h3>
                        <span>{props.currentUser.first_name + ' ' + props.currentUser.last_name}</span>
                    </div>
                    }
                </div>

                <div className="sidebarBusinessProfile__body__section">
                    <div className="sidebarBusinessProfile__body__section__header">
                        <h5>Business Profile</h5>
                    </div>

                    {!isLoaded &&
                    <span>Loading</span>
                    }

                    {isLoaded &&
                    <div className="sidebarBusinessProfile__body__section__subSection">

                        <div className={"sidebarBusinessProfile__body__avatarContainer" + (props.isAdmin ? " editable" : "")}>
                            <FileInput innerRef={fileInput} handleSelectedFiles={(file) => updateProfilePhoto(file)} accept="image/jpeg, image/png" multiple={false} />
                            <Avatar src={profilePhoto ? "data:image/png;base64," + profilePhoto : undefined} onClick={handleBusinessProfileAvatarClick} />
                        </div>

                        <form onSubmit={updateBusinessProfile}>
                            <div>
                                <TextField value={about} onChange={e => setAbout(e.target.value)} label="About" size="medium" multiline={true} fullWidth={true} InputProps={{readOnly: !props.isAdmin}} />
                                <TextField value={address} onChange={e => setAddress(e.target.value)} label="Address" size="medium" fullWidth={true} InputProps={{readOnly: !props.isAdmin}} />
                                <TextField value={description} onChange={e => setDescription(e.target.value)} label="Description" size="medium" fullWidth={true} InputProps={{readOnly: !props.isAdmin}} />
                                <TextField value={email} onChange={e => setEmail(e.target.value)} label="E-mail" size="medium" fullWidth={true} InputProps={{readOnly: !props.isAdmin}} />

                                <FormControl fullWidth={true} disabled={!props.isAdmin}>
                                    <InputLabel id="vertical-label">Vertical</InputLabel>
                                    <Select value={vertical} onChange={(event) => setVertical(event.target.value)} labelId="vertical-label">
                                        <MenuItem value="">None</MenuItem>

                                        {verticalOptions.map((verticalOption, index) =>
                                            <MenuItem key={index} value={verticalOption}>{verticalOption}</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </div>

                            {props.isAdmin &&
                            <div className="sidebarBusinessProfile__body__section__subSection__action">
                                <Button type="submit" disabled={isUpdating} color="primary" size="large">Update</Button>
                            </div>
                            }
                        </form>
                    </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default BusinessProfile;
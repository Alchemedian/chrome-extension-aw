const APP_NAME = "AW Civilizer"

const LOCAL_STORAGE_KEY_NAME = '_ku_data'


// acronym: [regex or function, emoji representaion, querySelector to search]
const ACRONYM_TO_SERVICE_REGEX = {
    'NBA': [isNba, "🙅🏾‍♂️", "form[name=frmProfile]"],
    'OWO': [/Oral without Protection\n/, "😋", "#dPref"],
    'CIM': [/CIM/, "👄", "#dPref"],
    'Swallow': [/Swallow/, "💊", "#dPref"],
    'Anal': [/"A" Levels/, "🍩", "#dPref"],
    'DFK': [/French Kissing\n/, "😘", "#dPref"],
    'Foot Worship': [/Foot Worship/, "👣", "#dPref"],
    'Rimming': [/Rimming \(giving\)/, "👅", "#dPref"],
    'Massage': [/Massage/, "💆‍♂️", "#dPref"],
    'HR': [/Hand Relief/, "✊", "#dPref"],
    'Strap On': [/Strap On/, "👺", "#dPref"],
    'Watersports': [/Watersports/, "🏄", "#dPref"],
    'Bareback': [/(Bareback|Unprotected Sex)/, "🤮", "#dPref"],
    'Deep Throat': [/Deep Throat/, "🧕", "#dPref"],
    'Tie & Tease': [/Tie & Tease/, "✝️", "#dPref"],
    'Prostate Massage': [/Prostate Massage/, "👆", "#dPref"],
}
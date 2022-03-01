const APP_NAME = "AW Civilizer"

const LOCAL_STORAGE_KEY_NAME = '_ku_data'


// acronym: [regex or function, emoji representaion, querySelector to search]
const ACRONYM_TO_SERVICE_REGEX = {
		'Penetration': [/Penetration/, "👌", "#dPref"],
	    'Fingering': [/Fingering\/Finger Play/, "🖕", "#dPref"],
	    'OWO': [/Oral without Protection\n/, "😋", "#dPref"],
	    'CIM': [/CIM/, "👄", "#dPref"],
	    'Swallow': [/Swallow/, "💊", "#dPref"],
	    'Deep Throat': [/Deep Throat/, "🧕", "#dPref"],
	    'DFK': [/French Kissing\n/, "😘", "#dPref"],
	    'Anal': [/"A" Levels/, "🍩", "#dPref"],
	    'Anal Play': [/Anal Play/, "👆", "#dPref"],
	    'Rimming': [/Rimming \(giving\)/, "👅", "#dPref"],
	    'Prostate Massage': [/Prostate Massage/, "👉", "#dPref"],
	    'Massage': [/Massage/, "💆‍♂️", "#dPref"],
	    'HR': [/Hand Relief/, "✊", "#dPref"],
	    'Watersports': [/Watersports/, "🏄", "#dPref"],
	    'NBA': [isNba, "🙅🏾‍♂️", "form[name=frmProfile]"],
	    'Extra bby': [extrasBby, "💰", "form[name=frmProfile]"],
	    'Foot Worship': [/Foot Worship/, "👣", "#dPref"],
	    'Tie & Tease': [/Tie & Tease/, "✝️", "#dPref"],
	    'Strap On': [/Strap On/, "👺", "#dPref"],
	    'Bareback': [/(Bareback|Unprotected Sex)/, "BB", "#dPref"],
}
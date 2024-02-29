interface Env {
	VITE_APPIZAP_SERVER_URL: string;
	// ... other variables
}

const env: Env = {
	VITE_APPIZAP_SERVER_URL: 'http://localhost:3000/api/',
};

// eslint-disable-next-line import/no-default-export
export default env;

import axios from "axios";

export class TooEasyRialService {
    async getData(url, params) {
        return await axios
            .get(url, { params: params })
            .then(response => {
                return response.data;
            })
            .catch(err => {
                console.error(err);
                return err;
            });
    }
}

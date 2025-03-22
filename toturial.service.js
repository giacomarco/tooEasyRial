import axios from './libraries/axios/Es/axios.js';

export class TutorialService {

	async getData(url, params) {

		return await axios.get(url,  {params: params })
			.then((response)=> {
				return  response.data
			})
			.catch((err)=> {
				console.error(err)
				return err;
			});
	}
}

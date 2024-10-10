import axios from "axios";


export const api = axios.create({
    baseURL:"http://localhost:3001/v1",
   headers:{
      "Authorization": "token h43895jt9858094bun6098grubn48u59dsgfg234543tf",
        "Accept":"*/*",
 }
 })
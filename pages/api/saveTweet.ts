// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { passingQuery } from '../../typings';

type Data = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const data:passingQuery=JSON.parse(req.body);

  const mutations={
    mutations:[
      {
        // patch :{
        //   id:data.id,
        //   insert:{
        //     after:"saves[-1]",
        //     items:[data.new_user]
        //   }
        // } need tro make changes to sanity schema.
      }
    ]
  }
  const apiEndpoint=`https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${process.env.NEXT_PUBLIC_SANITY_DATASET}`;
  
  const result=await fetch(apiEndpoint,{
    headers:{
      'content-type':'application/json',
      Authorization:`Bearer ${process.env.SANITY_API_TOKEN}`
    },
    body:JSON.stringify(mutations),
    method:'POST'
  })

  const json=await result.json();

  res.status(200).json({ message:'Saved!' })
}

'use client';
export default function Prod({params}){
    return (
 <div className= " min-h-screen flex flex-col sm:ml-14 p-4 w-full h-full    bg-gray-200"  >

         <div className="flex flex-row w-full h-auto gap-14">
            <img className="w-1/4 h-1/4" 
                src="https://reactnative.dev/img/tiny_logo.png"
            />
            <div className="bg-white w-32 h-8 rounded-xl shadow-xl text-center">
                <h2 className=" text-lg text-gray-600 font-bold font-sans" > codigo:{params.codigo}</h2>
            </div>
         
        </div>

        <div>
            <div className="bg-white   h-8 rounded-xl shadow-xl text-center">
                <h2 className=" text-lg text-gray-600 font-bold font-sans" > Descricao:{params.Descricao}</h2>
            </div>
         
        </div>
  </div>
    )
}
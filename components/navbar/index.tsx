import AuthContex from "@/contexts/AuthContext";
import Image from "next/image"
import { useContext } from "react";

export default   function Navbar  () {

  const { nomeEmpresa} = useContext(AuthContex);

  return (
    <nav className=" w-full bg-black sm:ml-14 p-2 flex justify-between ">
         <Image 
          className="rounded-sm ml-1"
            src="/images/next.jpg"
            alt="img"
            width={80}
            height={80}
         />

      <span className="text-white  font-sans font-bold text-3xl -left-20 ">
        { nomeEmpresa } 
      </span>

    </nav>
    )
}
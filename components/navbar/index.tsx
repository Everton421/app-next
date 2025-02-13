import Image from "next/image"

export default   function Navbar  () {
    return (
    <nav className=" w-full bg-black sm:ml-14 p-2 ">
         <Image 
          className="rounded-sm ml-1"
            src="/images/next.jpg"
            alt="img"
            width={80}
            height={80}
         />
    
    </nav>
    )
}
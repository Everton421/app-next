import Image from "next/image"

export default   function Navbar  () {
    return (
    <nav className=" w-full bg-black sm:ml-14 p-4 ">
         <Image 
          className="rounded-sm"
            src="/images/next.jpg"
            alt="img"
            width={100}
            height={100}
         />
    
    </nav>
    )
}
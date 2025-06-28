import { useState } from "react";

const temp = () => {

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setIsScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            {/* <nav
        className={`relative top-0 left-0 right-0 transition-all duration-300 py-2 backdrop-blur-sm
          ${isScrolled ? 'bg-[#030B17]/80 border-gray-700 shadow-lg' : 'bg-transparent border-gray-800'}
          `}
      > */}
            {/* <nav className="relative w-full transition-all duration-300 py-2 backdrop-blur-sm bg-transparent">
        <div className="w-full px-6 xl:px-20 flex justify-between items-center transition-all duration-300">
          <div className="text-base font-gamefont text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-cyan-500 tracking-widest">
            POLLCHAIN
          </div>
          <div className='relative hidden md:flex text-sm text-white/80 bg-[#091623]/90 rounded-2xl xl:mr-20'>
            Gradient Border Top
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-lg"
              style={{
                background: 'linear-gradient(90deg, transparent 10%, #022536 50%, transparent 90%)'
              }}
            >
            </div>
            <ul className="flex space-x-8 xl:space-x-20 px-10 md:px-10 xl:px-44 py-5">
              <li className="hover:text-white cursor-pointer">Home</li>
              <li className="hover:text-white cursor-pointer">Bridge</li>
              <li className="hover:text-white cursor-pointer">Token Info</li>
              <li className="hover:text-white cursor-pointer">Contact us</li>
            </ul>
            Gradient Border Bottom
            <div
              className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-lg"
              style={{
                background: 'linear-gradient(90deg, transparent 10%, #022536 50%, transparent 90%)'
              }}
            >
            </div>
          </div>
          <button className="bg-[#0B1D3A] px-4 py-2 rounded-full border border-blue-500 hover:bg-blue-500 hover:text-black transition">
            Connect
          </button>
        </div>
      </nav> */}

            {/* if Fixed avbar then uncomment this */}
            {/* <div className="h-[72px] md:h-[80px]" /> */}
        </>
    )
}

export default temp

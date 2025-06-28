import GradientBorderButton from "../../components/GradientBorderButton";

const SupportNetwork = () => {
  return (
    <section className="py-20 px-4 text-center sm:bg-[url('/images/support-network-section/bg.png')] bg-none bg-no-repeat bg-cover">
      <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 from-20% md:from-40% via-cyan-500 via-60% to-cyan-500">
        Support Network
      </h2>
      <p className="mt-5 text-white/60 max-w-2xl mx-auto">
        Through our dedicated bridge, you can seamlessly move your assets
        between two versions Networks, unifying your token experience
      </p>
      <div className="w-full flex justify-center items-center mt-10">
        <GradientBorderButton
          enableHoverScale={false}
          isActive={false}
          onClick={null}
          direction="vertical"
        >
          <div className="flex justify-center items-center space-x-10 my-5 md:my-10">
            <div className="flex justify-center items-center space-x-3">
              <div className="flex flex-col justify-center items-center text-xs md:text-sm text-white/60">
                <p>ERC20</p>
                <p>Network</p>
              </div>
              <img
                className="w-24 md:w-full"
                src="/images/support-network-section/eth-coin.png"
                alt="ethereum-coin-image"
              />
            </div>
            <div className="flex justify-center items-center space-x-3">
              <img
                className="w-24 md:w-full"
                src="/images/support-network-section/bnb-coin.png"
                alt="bnb-coin-image"
              />
              <div className="flex flex-col justify-center items-center text-xs md:text-sm text-white/60">
                <p>BEP20</p>
                <p>Network</p>
              </div>
            </div>
          </div>
        </GradientBorderButton>
      </div>
    </section>
  );
};

export default SupportNetwork;

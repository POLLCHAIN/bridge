const Footer = ({ bridge = false }) => {
  return (
    <footer className="w-full bg-[url('/images/footer-section/footer-bg.png')] bg-no-repeat bg-cover bg-bottom md:bg-center-bottom">
      <div
        className={`w-full backdrop-blur-sm relative text-center py-14 px-6 ${
          bridge === true
            ? "md:flex md:justify-around md:items-center space-y-7 md:space-y-0"
            : "space-y-7"
        } `}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-lg"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #022536 50%, transparent 100%)",
          }}
        ></div>
        <div>
          <div className="font-gamefont text-lg pb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-100 from-20% md:from-40% via-cyan-500 via-50% md:via-60% to-cyan-500 tracking-widest">
            SWAP.POLLCHAIN
          </div>
          <div className="flex justify-center space-x-10 text-white/60 text-sm pb-4">
            {[
              { name: "telegram", url: "https://t.me/pollchain" },
              { name: "medium", url: "https://medium.com/pollchain" },
              { name: "twitter", url: "https://x.com/pollchain" },
              {
                name: "ethereum",
                url: "https://etherscan.io/token/0x4b0f027d0b694Aae2761ED2d426295d4f949F5d0",
              },
              {
                name: "binance",
                url: "https://bscscan.com/token/0x5c16712e796647cAA4Bc900632fa7A2DA9AeCE13",
              },
            ].map((social) => (
              <img
                key={social}
                className="w-6 cursor-pointer"
                src={`/images/footer-section/${social.name}-logo.png`}
                alt={social}
                onClick={() => {
                  window.open(social.url, "_blank");
                }}
              />
            ))}
          </div>
        </div>

        {bridge && (
          <div className="hidden md:block h-12 w-0.5 bg-neutral-100 dark:bg-white/10" />
        )}

        <div
          className={
            !bridge
              ? "hidden"
              : "flex flex-col gap-0 md:flex-row md:gap-12 md:items-center"
          }
        >
          <div
            className={`text-sm text-white ${"flex lg:gap-12 gap-6 justify-center"}`}
          >
            <span
              onClick={() => {
                window.open("https://coinmarketcap.com/currencies/pollchain/");
              }}
              className="hover:text-white/50 cursor-pointer"
            >
              Token Chart
            </span>
            <span
              onClick={() =>
                window.open("https://linktr.ee/Pollchain", "_blank")
              }
              className="hover:text-white/50 cursor-pointer"
            >
              Support
            </span>
            <span
              className="hover:text-white/50 cursor-pointer"
              onClick={() => {
                window.open(
                  "https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F3nqPxUtk6Q23Y0yLhe7d%2Fuploads%2FcdkwbunOJUHNMySUXYZP%2Fwp_en.pdf?alt=media&token=135fe78e-4175-4f01-bca3-03a435ebdc55",
                  "_blank"
                );
              }}
            >
              Whitepaper
            </span>
          </div>
        </div>

        {bridge && (
          <div className="hidden md:block h-12 w-0.5 bg-neutral-100 dark:bg-white/10" />
        )}

        <p className={`text-xs text-white/50 ${bridge ? "" : "pt-5"}`}>
          © 2025 Pollchain team. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

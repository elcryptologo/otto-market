import React from 'react';
import Image from 'next/image';

import images from '../assets';

const howto = () => (
  <div className="otto_main">
    <div className="otto_content">

      {/* <!-- NavBar --> */}

      <div className="navbar">
        <div className="container">
          <nav className="navbar_inner">
            <a href="index.html" className="h1">otto</a>
            <ul className="otto_menu">
              <li><a href="#what_otto">What&apos;s</a></li>
              <li><a href="#how_works">How it works</a></li>
              <li><a href="#mint_nft">NFT</a></li>
              <li><a href="#road_map">Road Map</a></li>
              <li><a href="#team">Team</a></li>
            </ul>
          </nav>

          {/* <!-- Hero Section --> */}

          <div className="hero_defi" id="hero_defi">
            <div className="hero_title">
              <h1>Let’s <span>deFi</span> Hollywood’s ancient Financing and Distribution system.</h1>
              <p className="t1">Introducing the Otto DeFi NFT’s and Streaming platform, which Empowers filmmakers and fans alike. This introduces an Innovating way for creators to access funding and distribute their own content.</p>
            </div>
            <div className="hero_image">
              <Image className="desktop_img" src={images.modelv21T1} alt="Model_V2_1_T 1" />
              {/* <Image className="mob_img" src={images.modelv21tmob} alt="Model_V2_1_T 1" /> */}

            </div>
          </div>

          {/* <!-- What is otto --> */}

          <div className="what_otto" id="what_otto">
            <div className="what_otto_title">
              <h2 className="h2">What is<span className="h1"> otto?</span></h2>
              <p className="t2">Otto offers innovative DeFi Movie NFT’s and a new Streaming Platform. Filmmakers can now sell their films intellectual property as NFT’s. Movies fans can now earn income from the films profits from the Otto Streaming platform, and the Movies Box Office. Investors can also sell their NFT’s in the Otto marketplace. Filmmakers can finance, distribute, and generate revenue, all in one place.</p>
            </div>
          </div>

          {/* <!-- How it works --> */}

          <div className="how_works" id="how_works">
            <div className="how_works_inner">
              <div className="how_works_content">
                <div className="works_title">
                  <h2 className="h2">How it works:</h2>
                </div>
                <div className="how_work_list">
                  <div className="nft_work nft_launch">
                    <div className="nft_work_img">
                      <Image src={images.rocket} alt="rocket" />
                    </div>
                    <div className="nft_work_text">
                      <h4 className="h3">NFT Launchpad:</h4>
                      <p className="t2">Creators can mint and sell a share of the intellectual property rights of their films as NFT’s. This minimizes the risks involved with film financing.</p>
                    </div>
                  </div>
                  <div className="nft_work nft_launch">
                    <div className="nft_work_img">
                      <Image src={images.group} alt="Group" />
                    </div>
                    <div className="nft_work_text">
                      <h4 className="h3">NFT Marketplace:</h4>
                      <p className="t2">This pioneering and vibrant ecosystem is where movie fans can generate passive income from the movies they love.</p>
                    </div>
                  </div>
                  <div className="nft_work nft_launch">
                    <div className="nft_work_img">
                      <Image src={images.ciltv} alt="TV" />
                    </div>
                    <div className="nft_work_text">
                      <h4 className="h3">Defi Streaming Platform:</h4>
                      <p className="t2">Filmmakers, Movie fans, and a Hype algorithm will select the films for the main catalog.</p>
                    </div>
                  </div>
                </div>
                <div className="nft_whitepaper">
                  <a href="https://drive.google.com/file/d/1jSJlygb9L86FMhsWgRTxIa3QAMvGwAO9/view" target="_blank" className="t3" rel="noreferrer">whitepaper</a>
                </div>
              </div>
              <div className="how_works_img">
                <Image className="desktop_img" src={images.v501t2} />
                {/* <Image className="mob_img" src={images.v501tmob} /> */}

              </div>
            </div>

          </div>

          {/* <!-- Mint NFT --> */}

          <div className="mint_nft" id="mint_nft">
            <div className="mint_nft_title">
              <h2 className="h1">Otto<span className="h4"> nft</span></h2>
              <p className="t4">The Breakthrough is a very exclusive collection of NFT’s. Only 10,000 NFT’s will be minted. NFT holders will be whitelisted for the Otto Token presale. They will have first access to buy the tokens at an exclusive price. Additionally, Holders will have access to Otto public and private events. Holders will have first access to all Movie NFT sales. Plus, Otto NFT holders will have access to movie premiers, and movie sets. Your NFT will always have utility and the potential to continually increase in value.</p>
            </div>
            <div className="mint_nft_img">
              <Image src={images.nftv22} />
              <Image src={images.nftv34} />
              <Image src={images.nftv42} />
              <Image src={images.nftv52} />
              <Image src={images.nftv11} />
            </div>
            <div className="mint_table_main">
              <ul className="responsive-table">
                <li className="table-header t1">
                  <div className="col col-1">Inspiration</div>
                  <div className="col col-2">Determination</div>
                  <div className="col col-3">Focus</div>
                  <div className="col col-4">Endurance</div>
                  <div className="col col-5">Breakthrough</div>
                </li>
                <li className="table-row t1">
                  <div className="col col-0">Q:</div>
                  <div className="col col-1 col-1-0">5,000</div>
                  <div className="col col-2 col-2-0">3,000</div>
                  <div className="col col-3 col-3-0">1,500</div>
                  <div className="col col-4 col-4-0">499</div>
                  <div className="col col-5 col-5-0">1</div>
                </li>
                <li className="table-row t1">
                  <div className="col col-0">$:</div>
                  <div className="col col-1 col-1-0">$150</div>
                  <div className="col col-2 col-2-0">$200</div>
                  <div className="col col-3 col-3-0">$250</div>
                  <div className="col col-4 col-4-0">$300</div>
                  <div className="col col-5 col-5-0">BID</div>
                </li>
              </ul>
            </div>
            <div className="min_opensea">
              <a href="https://opensea.io/collection/thebreakthrough" target="_blank" rel="noreferrer">
                <Image src={images.opensea} />
              </a>
            </div>
          </div>

          {/* <!-- Punch Line --> */}

          <div className="punch_line">
            <div className="punch_content">
              <h2 className="h1">Otto</h2>
              <h4 className="h4">offers a revolutionary new way to finance, own and stream movies.</h4>
            </div>
          </div>

          {/* <!-- Road Map --> */}

          <div className="road_map" id="road_map">
            <div className="road_map_content">
              <div className="road_map_img">
                <Image src={images.modelv21t2} />
              </div>
              <div className="road_map_title">
                <h2 className="h2">Road Map 2022:</h2>
                <div className="road_map_path">
                  <li className="t2">NFT Launch</li>
                  <li className="t2">V2 whitepaper release </li>
                  <li className="t2">Token Pre-sale</li>
                  <li className="t2">Token Launch</li>
                  <li className="t2">V3 whitepaper release</li>
                  <li className="t2">Certik Audit</li>
                  <li className="t2">NTF Marketplace</li>
                  <li className="t2">NTF Streaming platform & Launching event.</li>
                </div>
              </div>
            </div>
          </div>

          {/* <!-- Team --> */}

          <div className="team" id="team">
            <div className="team_content">
              <div className="team_title">
                <h2 className="h2">TEAM:</h2>
              </div>
              <div className="team_box">
                <div className="team_box_content rolando_gil">
                  <div className="box_img ceo">
                    <Image src={images.ceo} />
                  </div>
                  <div className="box_title">
                    <h5 className="h5">Rolando Gil</h5>
                    <h6 className="h6">Chief Executive Officer</h6>
                    <p className="t5">An award-winning filmmaker with over 10 years of experience in the film industry.</p>
                    <div className="box_icon">
                      <a href="https://www.linkedin.com/in/rolando-gil-2a60b588/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-linkedin" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="team_box_content jeff_simp">
                  <div className="box_img cmo">
                    <Image src={images.mariocanvas} />
                  </div>
                  <div className="box_title">
                    <h5 className="h5">Mario Rafael Ayala</h5>
                    <h6 className="h6">Chief Blockchain Developer</h6>
                    <p className="t5">Blockchain Developer and Software Engineer with extensive experience in Enterprise Web/Mobile applications specializing in security, performance, scalability, and reliability.</p>
                    <div className="box_icon">
                      <a href="https://www.linkedin.com/in/marioayalamscs/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-linkedin" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="team_box_content jon_yudi">
                  <div className="box_img advisor">
                    <Image src={images.advisor} />
                  </div>
                  <div className="box_title">
                    <h5 className="h5">Jonathan Yudis</h5>
                    <h6 className="h6">Advisor</h6>
                    <p className="t5">Filmmaker, Community Leader, Realtor, and Crypto Entrepreneur. He is president of Infinite Entertainment Now.</p>
                    <div className="box_icon">
                      <a href="https://www.linkedin.com/in/jonathanyudisrealtor/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-linkedin" />
                      </a>
                    </div>
                  </div>
                </div>

              </div>
              <div className="otto_connect">
                <h3 className="h3">Connect:</h3>
                <div className="connect_icons">
                  <a href="https://www.instagram.com/ottonftt/" target="_blank" rel="noreferrer">
                    <Image src={images.instagram} />
                  </a>
                  <a href="https://t.me/ottonftt" target="_blank" rel="noreferrer">
                    <Image src={images.telegram} />
                  </a>
                  <a href="https://discord.gg/EfhD89Gy" target="_blank" rel="noreferrer">
                    <Image src={images.discord} />
                  </a>
                  <a href="https://twitter.com/ottonftt" target="_blank" rel="noreferrer">
                    <Image src={images.twitter} />
                  </a>
                  <a href="https://medium.com/@ottonftt" target="_blank" rel="noreferrer">
                    <Image src={images.medium} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default howto;

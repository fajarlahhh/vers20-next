/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import Link from 'next/link';
import Image from 'next/image';
import { DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { signOut } from 'next-auth/react';

function Header({ session }) {
  return (
    <>
      <div className="header">
        <div className="container">
          <div className="row">
            <div className="col-xxl-12">
              <div className="header-content">
                <div className="header-left">
                  <div className="brand-logo">
                    <Link href="/">
                      <a className="mini-logo">
                        <Image
                          src="/images/logo.png"
                          height={51.6}
                          width={120}
                          alt="Logo"
                        />
                      </a>
                    </Link>
                  </div>
                </div>

                <div className="header-right">
                  <UncontrolledDropdown
                    tag="div"
                    className="dropdown profile_log"
                  >
                    <DropdownToggle tag="div" data-toggle="dropdown">
                      <div className="user icon-menu active">
                        <span>
                          <img src="/images/user.png" alt="" />
                        </span>
                      </div>
                    </DropdownToggle>
                    <DropdownMenu right className="dropdown-menu">
                      <div className="user-email">
                        <div className="user">
                          <div className="user-info">
                            <h5>Jannatul Maowa</h5>
                            <span>imsaifun@gmail.com</span>
                          </div>
                        </div>
                      </div>
                      <Link href="/profile">
                        <a className="dropdown-item">
                          <span>
                            <i className="ri-user-line" />
                          </span>
                          Profile
                        </a>
                      </Link>
                      <Link href="/signin">
                        <a
                          className="dropdown-item logout"
                          onClick={() => signOut({ callbackUrl: '/signin' })}
                        >
                          <i className="ri-logout-circle-line" />
                          Logout
                        </a>
                      </Link>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Header;

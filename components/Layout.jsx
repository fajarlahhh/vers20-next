import { useEffect, useState } from 'react';
import Header from './Header';
import PageHead from './PageHead';
import PageTitle from './PageTitle';
import Sidebar from './Sidebar';

const Layout = ({
  headTitle,
  children,
  pageTitle,
  pageTitleSub,
  pageClass,
  parent,
  child,
  session,
}) => {
  const [height, setHeight] = useState();
  useEffect(() => {
    setHeight(window.screen.height);
  }, []);
  return (
    <>
      <PageHead headTitle={headTitle} />
      <div id="main-wrapper" className={pageClass}>
        <Header session={session} />
        <Sidebar />

        <div className="content-body" style={{ minHeight: height - 122 }}>
          <div className="container">
            {pageTitle && (
              <PageTitle
                pageTitle={pageTitle}
                pageTitleSub={pageTitleSub}
                parent={parent}
                child={child}
              />
            )}
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;

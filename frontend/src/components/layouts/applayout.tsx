import React, { type FunctionComponent } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { selectIsShowingSidebar } from '../../redux/configSlice';
import { useAppSelector } from '../../redux/hooks';
import { SidebarInset, SidebarProvider } from '../ui/sidebar';
import Footer from './footer';
import Header from './header';
import Sidebar from './sidebar';
import TabsBar from './tabsbar';

const AppLayout: FunctionComponent = () => {
  const location = useLocation();

  const isShowingSidebar: boolean = useAppSelector(selectIsShowingSidebar);

  const showTabsBar = location.pathname.startsWith('/db') ? true : false;

  return (
    <SidebarProvider open={isShowingSidebar}>
      <div className='flex min-h-screen w-full'>
        <Sidebar />
        <SidebarInset className='flex flex-1 flex-col'>
          <Header />
          <div className='flex flex-1'>
            <main className='flex flex-1 flex-col'>
              {showTabsBar && <TabsBar />}
              <div id='maincontent' className='flex-1 p-4'>
                <Outlet />
              </div>
            </main>
          </div>
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;

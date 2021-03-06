import React from 'react';
import {
  connect
} from 'react-redux';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { Layout } from 'antd';
import {
  MenuFoldOutlined,
} from '@ant-design/icons';
import {
  isEqual
} from "lodash";

import networkStateBranch from '../state/networks';
import selectionStateBranch from '../state/selections';
import foodResourcesStateBranch from '../state/food-resources';
import MapView from '../components/Map';
import SubmitButton from '../components/SubmitButton';
import Filters from '../components/Filters';
import ListView from '../components/ListView';
import About from '../components/About';
import Resources from '../components/Resources'
import NavMenu from '../components/NavMenu'
import PageFooter from '../components/PageFooter'
import Press from '../components/Press';
import PrivacyPolicy from '../components/PrivacyPolicy'
import Banner from '../components/Banner';

import './style.scss';
import NoWebGl from '../components/NoWebGl';
import NetworksTable from '../components/NetworksTable';

import { translations } from './language'

const { Header, Content, Sider } = Layout;
const mapboxgl = window.mapboxgl;
class DefaultLayout extends React.Component {
  constructor(props) {
    super(props)
    this.listRef = React.createRef();
    this.state = {
      isMobile: false,
      collapsed: true,
    }
  }

  componentDidMount() {
    const {
      requestNetworks,
      requestFoodResources
    } = this.props;
    requestNetworks();
    requestFoodResources();
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  }

  componentDidUpdate(prevProps) {
    const { visibleCards } = this.props;
    if (!isEqual(visibleCards, prevProps.visibleCards) && this.listRef.current) {
      this.listRef.current.scrollIntoView();
    }
  }

  handleNav = (e) => {
    const {
      resetToDefaultView
    } = this.props
    if (this.state.isMobile) this.setState({collapsed: true});
    resetToDefaultView();
  }

  toggleCollapsibleMenu = () => {
    this.setState({collapsed: !this.state.collapsed})
  }

  checkIfMobile = () => {
    window.innerWidth <= 768 ? this.setState({isMobile: true}) : this.setState({isMobile: false})
  }

  renderPageHeader = () => {
    const {
      setSiteLanguage,
      siteLanguage,
    } = this.props
    if (!this.state.isMobile) {
      return (
        <Header>
          <NavMenu
            mode='horizontal'
            handleNav={this.handleNav}
            setSiteLanguage={setSiteLanguage}
            siteLanguage={siteLanguage}
          />
        </Header>
      )
    } else if (this.state.collapsed) {
      return (
        <Header onClick={this.toggleCollapsibleMenu}>
          <MenuFoldOutlined className='menu-btn'/>
        </Header>
      )
    } else {
      return (
        <Sider trigger={null}>
          <NavMenu
            mode='inline'
            handleNav={this.handleNav}
            setSiteLanguage={setSiteLanguage}
            siteLanguage={siteLanguage}
          />
        </Sider>
      )
    }
  }

  render() {
    const {
      setFilters,
      selectedCategories,
      filteredNetworks,
      viewState,
      setLatLng,
      setUsState,
      visibleCards,
      allNetworks,
      setHoveredPoint,
      hoveredPointId,
      masterBbox,
      resetToDefaultView,
      foodResourceGeoJson,
      filterCounts,
      siteLanguage,
    } = this.props;
    
    if (!allNetworks.length) {
      return null;
    }
    // viewState --> list or default
    return (
      <Router>
        <Layout className="layout">
          {this.renderPageHeader()}
          <Layout>
            <Content style={{ padding: '0 50px' }}>
              <div className="main-container">
                <Switch>
                  <Route path='/table-view'>
                    <NetworksTable networks={allNetworks} siteLanguage={siteLanguage} />
                  </Route>
                  <Route path='/about'>
                    <About siteLanguage={siteLanguage} />
                  </Route>
                  <Route path='/resources'>
                    <Resources siteLanguage={siteLanguage} />
                  </Route>
                  <Route path='/press'>
                    <Press />
                  </Route>
                  <Route path='/site-information'>
                    <PrivacyPolicy />
                  </Route>
                  <Route path='/'>
                    {mapboxgl.supported() ? <>
                      <Banner/>
                      <Filters 
                        setFilters={setFilters}
                        selectedCategories={selectedCategories}
                        absolute={true}
                        visible={viewState ==='default'}
                      />
                      <div className={`interactive-content-${viewState}`}>
                        <MapView
                          networks={filteredNetworks}
                          viewState={viewState}
                          setLatLng={setLatLng}
                          selectedCategories={selectedCategories}
                          resetToDefaultView={resetToDefaultView}
                          hoveredPointId={hoveredPointId}
                          setHoveredPoint={setHoveredPoint}
                          bbox={masterBbox}
                          setUsState={setUsState}
                          foodResourceGeoJson={foodResourceGeoJson}
                        />
                        <ListView
                          listRef={this.listRef}
                          filterCounts={filterCounts}
                          visibleCards={visibleCards}
                          setHoveredPoint={setHoveredPoint}
                          setFilters={setFilters}
                          selectedCategories={selectedCategories}
                          siteLanguage={siteLanguage}
                        />
                      </div>
                    </>: <NoWebGl />}
                    <div className="tagline">
                      {translations.tagline[siteLanguage]}
                    </div>
                    <SubmitButton
                      link='https://docs.google.com/forms/d/e/1FAIpQLScuqQtCdKsDzvTzaA2PMyVHX7xcOqbOW7N7l_0YJASV4wMBVQ/viewform'
                      description={translations.submitButton[siteLanguage]}
                    />
                  </Route>
                </Switch>
              </div>
            </Content>
            <PageFooter siteLanguage={siteLanguage} />
          </Layout>
        </Layout>
      </Router>
    );
  }
}

const mapStateToProps = (state) => ({
  filteredNetworks: networkStateBranch.selectors.getFilteredNetworks(state),
  selectedCategories: selectionStateBranch.selectors.getSelectedCategories(state),
  foodResourceGeoJson: foodResourcesStateBranch.selectors.getFoodResourcesGeoJson(state),
  viewState: selectionStateBranch.selectors.getViewState(state),
  searchLocation: selectionStateBranch.selectors.getSearchLocation(state),
  visibleCards: networkStateBranch.selectors.getVisibleCards(state),
  allNetworks: networkStateBranch.selectors.getAllNetworks(state),
  hoveredPointId: selectionStateBranch.selectors.getHoveredPointId(state),
  masterBbox: networkStateBranch.selectors.getBoundingBox(state),
  allFoodResources: foodResourcesStateBranch.selectors.getAllFoodResources(state),
  filterCounts: networkStateBranch.selectors.getFilterCounts(state),
  siteLanguage: selectionStateBranch.selectors.getSiteLanguage(state),
});

const mapDispatchToProps = (dispatch) => ({
  requestNetworks: () => dispatch(networkStateBranch.actions.requestNetworks()),
  requestFoodResources: () => dispatch(foodResourcesStateBranch.actions.requestFoodResources()),
  setFilters: (payload) => dispatch(selectionStateBranch.actions.setCategoryFilters(payload)),
  setLatLng: (payload) => dispatch(selectionStateBranch.actions.setLatLng(payload)),
  setHoveredPoint: (payload) => dispatch(selectionStateBranch.actions.setHoveredPoint(payload)),
  setSiteLanguage: (payload) => dispatch(selectionStateBranch.actions.setSiteLanguage(payload)),
  setUsState: (payload) => dispatch(selectionStateBranch.actions.setUsState(payload)),
  resetToDefaultView: () => dispatch(selectionStateBranch.actions.resetToDefaultView())
});

export default connect(mapStateToProps, mapDispatchToProps)(DefaultLayout);

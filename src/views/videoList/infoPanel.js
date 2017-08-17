import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import Table from '../../components/Table/Table';
import Button from '../../components/Button/Button';
import Tabs from '../../components/Tabs/Tabs';
import TabPanel from '../../components/Tabs/TabPanel';
import UploadButton from '../../components/UploadButton/UploadButton';
import Utils from '../../components/Utils/Utils';
let utils = new Utils();

export default class InfoPanel extends Component {
    constructor(props) {
        super(props);

        this.handleSaveClick = this.handleSaveClick.bind(this);
        this.handleCloseClick = this.handleCloseClick.bind(this);
        this.handleUploadBtnChange = this.handleUploadBtnChange.bind(this);

        let tableData = {
            theadData: {
                status: '发布状态',
                df: '码率数',
                th1: '流畅编码',
                th2: '高清编码',
                th3: '超清编码',
                th11: '流畅切片',
                th22: '高清切片',
                th33: '超清切片'
            },
            tbodyData: []
        };
        this.state = {
            tableData,
            videoCoverUrl: '',
            uploadData: {},
            editStatus: false,
            tabIndex: 0
        };
    }

    changeCoverByMethod_1() {
        let file = this.file;
        if (!file) {
            return;
        }
        let {
            userData,
            videoInfo
        } = this.props;
        utils.uploadFile({
            url: this.props.BASE_URL.getVideoList,
            queryParams: {
                method: 'upFirstImage2'
            },
            data: {
                vid: videoInfo.vid,
                userid: userData.userid,
                ts: userData.ts,
                sign: userData.sign,
                Filedata: file
            },
            done: res => this.doneSave(res)
        });
    }
    changeCoverByMethod_2() {
        let {
            userData,
            videoInfo
        } = this.props;
        let {
            uploadData
        } = this.state;

        let extraData = uploadData.hasOwnProperty('selectedIndex') ? {
            selectedIndex: uploadData.selectedIndex
        } : {
            recentId: uploadData.recentId
        };

        let data = {
            method: 'selectImage2',
            userid: userData.userid,
            ts: userData.ts,
            sign: userData.sign,
            vid: videoInfo.vid
        };
        Object.assign(data, extraData);

        utils.getJSON({
            url: this.props.BASE_URL.getVideoList,
            data,
            done: res => this.doneSave(res)
        });
    }
    doneSave(res) {
        if (res.error === '0') {
            console.log('成功更换封面！');
        }
    }
    handleImgClick(params) {
        let uploadData = params.hasOwnProperty('selectedIndex') ? {
            selectedIndex: params.selectedIndex
        } : {
            recentId: params.recentId
        };
        this.uploadMethod = this.changeCoverByMethod_2;
        this.setState({
            editStatus: true,
            videoCoverUrl: params.imgUrl,
            uploadData
        });
    }
    handleSaveClick() {
        this.isChange = true;
        this.setState({
            editStatus: false,
        });
        if (this.uploadMethod instanceof Function) {
            this.uploadMethod();
        } else {
            console.log('this.uploadMethod');
            console.log(this.uploadMethod);
        }
    }
    handleCloseClick() {
        this.setState({
            editStatus: false,
            videoCoverUrl: '',
        });
        this.uploadMethod = null;
        this.props.closeInfoPanel(this.isChange);
    }
    handleUploadBtnChange(files) {
        let file = files[0];
        this.file = file;
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            this.setState({
                editStatus: true,
                videoCoverUrl: event.target.result
            });
            this.uploadMethod = this.changeCoverByMethod_1;
        };
    }

    componentWillReceiveProps(nextProps) {
        let {
            videoInfo,
        } = nextProps;
        if (!videoInfo) {
            return;
        }

        function getSize(sizeArr) {
            let tempArr = Array(3).fill('-'),
                len = sizeArr.length;
            for (let i = 0; i < len; i++) {
                tempArr[i] = utils.transformSize(sizeArr[i]);
            }
            return tempArr;
        }

        let transformSize = utils.transformSize;
        let tableData = Object.assign({}, this.state.tableData);
        let {
            theadData,
            tbodyData,
        } = tableData;
        let {
            status,
            df,
            filesize,
            tsfilesize1,
            tsfilesize2,
            tsfilesize3
        } = videoInfo;
        status = utils.transformStatus(status);

        let [th1, th2, th3] = getSize(filesize);
        let [th11, th22, th33] = getSize([tsfilesize1, tsfilesize2, tsfilesize3]);

        tbodyData = [{
            status,
            df,
            th1,
            th2,
            th3,
            th11: tsfilesize1 ? transformSize(th11) : '-',
            th22: tsfilesize1 ? transformSize(th22) : '-',
            th33: tsfilesize1 ? transformSize(th33) : '-',
        }];
        this.setState({
            tableData: {
                theadData,
                tbodyData,
            },
            tabIndex: 0,
        });
    }

    render() {
        let {
            tableData,
            videoCoverUrl,
            editStatus,
            tabIndex,
        } = this.state;

        let {
            videoInfo,
            latestPic
        } = this.props;

        if (!videoInfo) {
            return false;
        }
        let tabsProps = {
            className: 'tabs-bar',
            activeIndex: tabIndex,
            onChange: options => {
                this.setState({
                    tabIndex: options.activeIndex
                });
            }
        };
        let uploadBtnProps = {
            value: '上传图片',
            name: 'uploadPic',
            onChange: this.handleUploadBtnChange,
            accept: 'image/*',
            multiple: false,
        };

        return (
            <div className="infoPanel" style={{display: this.props.visible ? 'block' : 'none'}}>
                <div className="btn-wrap">
                    <Button value="保存" visible={editStatus} onClick={this.handleSaveClick} />
                    <Button value="取消并关闭" visible={editStatus} onClick={this.handleCloseClick} />
                    <Button value="关闭" visible={!editStatus} onClick={this.handleCloseClick} />
                </div>
                <section className="section_1">
                    <div className="thumbnail">
                        <img alt={videoInfo.title} 
                            src={videoCoverUrl.trim() !== '' ? videoCoverUrl : videoInfo.first_image} />
                        <div className="btnGroup">
                            <UploadButton {...uploadBtnProps} />
                        </div>
                    </div>
                    <div className="msg">
                        <dl>
                            <dt>标题：</dt>
                            <dd>{videoInfo.title}</dd><br/>
                            <dt>时长：</dt>
                            <dd>{videoInfo.duration}</dd><br/>
                            <dt>上传时间：</dt>
                            <dd>{videoInfo.ptime}</dd><br/>
                            <dt>vid：</dt>
                            <dd>{videoInfo.vid}</dd><br/>
                            <dt>播放器地址：</dt>
                            <dd>{videoInfo.swf_link}</dd><br/>
                        </dl>
                    </div>
                </section>
                <section className="section_2">
                    <Table theadData={tableData.theadData} tbodyData={tableData.tbodyData} />
                </section>
                <section className="section_3">
                    <Tabs {...tabsProps}>
                        <TabPanel className="screenshot" order="0" tab={'视频截图'}>
                            {videoInfo.images && videoInfo.images.map((imgUrl, index) => {
                                return <img src={imgUrl} key={index} onClick={this.handleImgClick.bind(this, {selectedIndex:index, imgUrl: imgUrl})} alt={`视频截图_${index}`}/>;
                            })}
                        </TabPanel>
                        <TabPanel className="uploadPic" order="1" tab={'最近上传'}>
                            {latestPic && latestPic.map((picInfo, index) => {
                                return <img src={picInfo.imgurlsmall} key={picInfo.id} onClick={this.handleImgClick.bind(this, {recentId:picInfo.id, imgUrl: picInfo.imgurlsmall})} alt={`最近上传_${index}`}/>;
                            })}
                        </TabPanel>
                    </Tabs>
                </section>
            </div>
        );
    }
}
InfoPanel.file = null;
InfoPanel.uploadMethod = null;
InfoPanel.isChange = false;

InfoPanel.propTypes = {
    userData: PropTypes.object,
    BASE_URL: PropTypes.object,
    visible: PropTypes.bool,
    videoInfo: PropTypes.object,
    latestPic: PropTypes.array,
};
InfoPanel.defaultProps = {
    userData: {},
    BASE_URL: {},
    visible: false,
    videoInfo: null,
    latestPic: [],
};

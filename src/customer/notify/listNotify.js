import React from "react";
import DB from "./../database/index";
import {connector} from "./../../callAxios";
import {
    Card,
    Col,
    Row,
    Table,
    CardBody,
    CardHeader
} from "reactstrap";

export default class notifiesComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            listNotifies: [],
            loaded: false,
            lasttime: new Date().getTime()
        }
        this.getDatabase = this.getDatabase.bind(this);
    }

    getDatabase = async (e) => { // Refresh token để gọi backend trước
        if (new Date().getTime() > this.state.lasttime + 5 * 1000 || this.state.loaded == false) {
            this.setState({loaded: true, lasttime: new Date().getTime()})
            DB.refreshToken();
            // Call axios
            const response = await connector.post(`/notify/all/`, {}).then((response) => {
                console.log("response", response);
                    let listNotifies = [];
                    response.data.rows.forEach(element => {
                        const notify_type = element.notify_type;
                        let notify_content = '';
                        if (notify_type == '0')
                        {
                            notify_content = `${element.sender_fullname} (${element.sender_account_number}) đã hủy nhắc nợ của bạn.`;
                        }
                        if (notify_type == '1')
                        {
                            notify_content = `${element.sender_fullname} (${element.sender_account_number}) đã thanh toán nhắc nợ của bạn.`;
                        }
                        listNotifies = listNotifies.concat([{
                            notify_id: element.notify_id,
                            sender_account_number: element.sender_account_number,
                            sender_fullname : element.sender_fullname,
                            receiver_account_number: element.receiver_account_number,
                            receiver_fullname: element.receiver_fullname,
                            message: element.message,
                            created_at: element.created_at,
                            notify_type: element.notify_type,
                            notify_content: notify_content
                        }]);
                });

                // Lưu vào state
                this.setState({listNotifies: listNotifies})
            }, (error) => {
                console.log("Error! Infor: ", error.response);
                const loi = 'Lỗi xảy ra. accessToken: ';
                const str = loi.concat(localStorage.getItem("accessToken"));
            });
        }
    }

    render = () => { // Realtime
        if (this.state.loaded == false)
            this.getDatabase();
        setTimeout(function () {
            this.getDatabase();
        }.bind(this), 10 * 1000);

        // Tải lên giao diện
        return (
            <div className="animated fadeIn">
                <Card style={
                    {borderStyle: 'none'}
                }>
                    <CardHeader style={
                        {
                            backgroundColor: '#435d7d',
                            textAlign: 'center',
                            color: 'white',
                            fontSize: '18px'
                        }
                    }>
                        <strong>Thông báo của bạn</strong>
                    </CardHeader>
                    <CardBody style={
                        {
                            borderStyle: 'ridge',
                            borderColor: '#435d7d'
                        }
                    }>
                        <Row>
                            <Col>
                                <Table responsive bordered>
                                    <thead>
                                        <tr>
                                            <th style = {{textAlign: "center"}}>--------===-===--------</th>
                                        </tr>
                                    </thead>
                                    <tbody> {
                                        this.state.listNotifies.map((item, index) => {
                                            return (
                                                <tr>
                                                    <th scope="row" style = {{fontFamily: "Segoe UI"}}>
                                                        <a href = {`/debt`}><b>{item.notify_content}</b></a>                                                        
                                                        <p style = {{fontSize: "13px"}}><br/>{item.message}</p>                                                        
                                                        <i><u style = {{fontSize: "12px"}}>{item.created_at}</u></i>
                                                    </th>
                                                </tr>
                                            )
                                        })
                                    } </tbody>
                                </Table>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
